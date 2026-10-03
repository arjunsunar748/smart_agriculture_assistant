"""
Official Agricultural Market Data Fetcher for Nepal.
Fetches live data from:
1. Agriculture Market Price Information System (AMPIS) - https://ampis.gov.np/
2. Kalimati Fruits and Vegetable Market Development Board - https://kalimatimarket.gov.np/

Adheres to polite crawling standards: respectful timeouts, headers, in-memory caching,
and zero aggressive scraping.
"""

import httpx
import re
import datetime
import asyncio
from typing import List, Dict, Any, Optional

from app.services.market.market_sources import OFFICIAL_SOURCES, REGIONAL_MARKETS
from app.services.market.market_normalizer import (
    parse_price_value,
    normalize_unit,
    normalize_crop_name,
    normalize_market_name,
    nepali_to_ascii_digits
)
from app.services.market.market_validator import validate_market_price, validate_arrival_record

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,ne;q=0.8"
}

class MarketDataFetcher:
    """Handles polite backend data retrieval from official Nepali agriculture sources."""

    def __init__(self, cache_ttl_seconds: int = 3600):
        self.cache_ttl = cache_ttl_seconds
        self._price_cache: Dict[str, Dict[str, Any]] = {}
        self._arrival_cache: Optional[Dict[str, Any]] = None
        self._last_kalimati_fetch: Optional[datetime.datetime] = None
        self._last_ampis_fetch: Optional[datetime.datetime] = None

    async def fetch_kalimati_today_prices(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Fetches current daily wholesale prices from Kalimati official board (101 commodities).
        Method: Arithmetic Average.
        """
        now = datetime.datetime.utcnow()
        cache_key = "kalimati_today"

        if not force_refresh and cache_key in self._price_cache:
            entry = self._price_cache[cache_key]
            if (now - entry["timestamp"]).total_seconds() < self.cache_ttl:
                return entry["data"]

        url = OFFICIAL_SOURCES["KALIMATI"]["price_url"]
        results = []

        try:
            async with httpx.AsyncClient(headers=DEFAULT_HEADERS, verify=False, timeout=15.0) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    # Return cached if available
                    if cache_key in self._price_cache:
                        return self._price_cache[cache_key]["data"]
                    return []

                html = resp.text

            # Parse HTML Table
            tables = re.findall(r'<table[^>]*>(.*?)</table>', html, re.DOTALL)
            if not tables:
                return []

            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tables[0], re.DOTALL)
            today_str = datetime.date.today().isoformat()

            for r in rows:
                cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
                # Kalimati format: [Commodity, Unit, Min, Max, Avg]
                if len(cols) >= 5:
                    c_name_raw = cols[0]
                    unit_raw = cols[1]
                    min_raw = cols[2]
                    max_raw = cols[3]
                    avg_raw = cols[4]

                    # Skip header
                    if 'न्यूनतम' in min_raw or 'Minimum' in min_raw or 'कृषि उपज' in c_name_raw:
                        continue

                    min_p = parse_price_value(min_raw)
                    max_p = parse_price_value(max_raw)
                    avg_p = parse_price_value(avg_raw)

                    if min_p is None or max_p is None:
                        continue

                    crop_slug, crop_display = normalize_crop_name(c_name_raw)
                    unit_clean = normalize_unit(unit_raw)

                    raw_item = {
                        "crop_slug": crop_slug,
                        "crop_name": crop_display,
                        "crop_name_ne": c_name_raw,
                        "market_id": "kalimati",
                        "market_name": "Kalimati Wholesale Market, Kathmandu",
                        "price_date": today_str,
                        "min_price": min_p,
                        "max_price": max_p,
                        "avg_price": avg_p or round((min_p + max_p) / 2.0, 2),
                        "representative_price": avg_p or round((min_p + max_p) / 2.0, 2),
                        "calculation_method": "arithmetic_average",
                        "unit": unit_clean,
                        "trend_7d_pct": 0.0,
                        "trend_30d_pct": 0.0,
                        "data_source": OFFICIAL_SOURCES["KALIMATI"]["name"],
                        "source_url": url,
                        "raw_data": cols
                    }

                    is_valid, sanitized, _ = validate_market_price(raw_item)
                    if is_valid and sanitized:
                        results.append(sanitized)

            if results:
                self._price_cache[cache_key] = {
                    "timestamp": now,
                    "data": results
                }
                self._last_kalimati_fetch = now

        except Exception as e:
            # Polite fallback to cache
            if cache_key in self._price_cache:
                return self._price_cache[cache_key]["data"]
            return []

        return results

    async def fetch_kalimati_daily_arrivals(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Fetches official commodity arrival volumes (kg) from Kalimati Board.
        """
        now = datetime.datetime.utcnow()
        if not force_refresh and self._arrival_cache:
            if (now - self._arrival_cache["timestamp"]).total_seconds() < self.cache_ttl:
                return self._arrival_cache["data"]

        url = OFFICIAL_SOURCES["KALIMATI"]["arrival_url"]
        results = []

        try:
            async with httpx.AsyncClient(headers=DEFAULT_HEADERS, verify=False, timeout=15.0, follow_redirects=True) as client:
                # 1. Get session & CSRF
                r1 = await client.get(url)
                csrf_match = re.search(r'name="_token"\s+value="([^"]+)"', r1.text)
                csrf = csrf_match.group(1) if csrf_match else ""

                # 2. Query today/yesterday arrivals
                today_str = datetime.date.today().isoformat()
                yesterday_str = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()

                # Check recent days until data table with rows is found
                found_rows = []
                arrival_date_used = today_str
                for delta in [0, 1, 2, 3]:
                    target_d = (datetime.date.today() - datetime.timedelta(days=delta)).isoformat()
                    try:
                        r2 = await client.post(url, data={"_token": csrf, "datePricing": target_d})
                        tables = re.findall(r'<table[^>]*>(.*?)</table>', r2.text, re.DOTALL)
                        if tables:
                            r_list = re.findall(r'<tr[^>]*>(.*?)</tr>', tables[0], re.DOTALL)
                            if len(r_list) > 1:
                                found_rows = r_list
                                arrival_date_used = target_d
                                break
                    except Exception:
                        continue

                if found_rows:
                    rows = found_rows
                    for r in rows:
                        cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
                        if len(cols) >= 3:
                            c_name_raw = cols[0]
                            unit_raw = cols[1]
                            qty_raw = cols[2]

                            if 'आगमन' in qty_raw or 'Arrival' in qty_raw or 'कृषि उपज' in c_name_raw:
                                continue

                            qty_val = parse_price_value(qty_raw)
                            if qty_val is not None:
                                crop_slug, crop_display = normalize_crop_name(c_name_raw)
                                raw_item = {
                                    "crop_slug": crop_slug,
                                    "crop_name": crop_display,
                                    "crop_name_ne": c_name_raw,
                                    "market_id": "kalimati",
                                    "market_name": "Kalimati Wholesale Market, Kathmandu",
                                    "arrival_date": arrival_date_used,
                                    "quantity_kg": qty_val,
                                    "unit": normalize_unit(unit_raw),
                                    "source": OFFICIAL_SOURCES["KALIMATI"]["name"],
                                    "source_url": url
                                }
                                is_valid, sanitized, _ = validate_arrival_record(raw_item)
                                if is_valid and sanitized:
                                    results.append(sanitized)

            if results:
                self._arrival_cache = {
                    "timestamp": now,
                    "data": results
                }

        except Exception:
            if self._arrival_cache:
                return self._arrival_cache["data"]
            return []

        return results

    async def fetch_ampis_regional_prices(self, market_uid: Optional[str] = None, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Fetches market-wise wholesale prices from AMPIS comparison tables across Nepal.
        Covers Dharan, Butwal, Pokhara, Kohalpur, Attariya, Birendranagar, etc.
        Method: Midpoint Price = (Min + Max) / 2 as per official technical note.
        """
        now = datetime.datetime.utcnow()
        cache_key = f"ampis_{market_uid or 'all'}"

        if not force_refresh and cache_key in self._price_cache:
            entry = self._price_cache[cache_key]
            if (now - entry["timestamp"]).total_seconds() < self.cache_ttl:
                return entry["data"]

        url = OFFICIAL_SOURCES["AMPIS"]["price_url"]
        params = {}
        if market_uid:
            params["uid_entityreference_filter"] = market_uid

        results = []

        try:
            async with httpx.AsyncClient(headers=DEFAULT_HEADERS, verify=False, timeout=15.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code != 200:
                    if cache_key in self._price_cache:
                        return self._price_cache[cache_key]["data"]
                    return []
                html = resp.text

            tables = re.findall(r'<table[^>]*>(.*?)</table>', html, re.DOTALL)
            today_str = datetime.date.today().isoformat()

            for tbl in tables:
                rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tbl, re.DOTALL)
                for r in rows:
                    cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
                    # AMPIS Comparison table format:
                    # [Market Name, Month, Day, Commodity, Unit, Min, Max, Avg]
                    if len(cols) >= 8:
                        m_name_raw = cols[0]
                        c_name_raw = cols[3]
                        unit_raw = cols[4]
                        min_raw = cols[5]
                        max_raw = cols[6]
                        avg_raw = cols[7]

                        if min_raw in ['न्यूनतम', 'Minimum'] or m_name_raw in ['कृषि बजार', 'Market', 'Market Name']:
                            continue

                        min_p = parse_price_value(min_raw)
                        max_p = parse_price_value(max_raw)
                        avg_p = parse_price_value(avg_raw)

                        if min_p is None or max_p is None:
                            continue

                        market_id, market_display = normalize_market_name(m_name_raw)
                        crop_slug, crop_display = normalize_crop_name(c_name_raw)

                        midpoint = round((min_p + max_p) / 2.0, 2)
                        rep_p = avg_p if avg_p is not None else midpoint

                        raw_item = {
                            "crop_slug": crop_slug,
                            "crop_name": crop_display,
                            "crop_name_ne": c_name_raw,
                            "market_id": market_id,
                            "market_name": market_display,
                            "price_date": today_str,
                            "min_price": min_p,
                            "max_price": max_p,
                            "avg_price": rep_p,
                            "representative_price": rep_p,
                            "calculation_method": "midpoint",
                            "unit": normalize_unit(unit_raw),
                            "trend_7d_pct": 0.0,
                            "trend_30d_pct": 0.0,
                            "data_source": OFFICIAL_SOURCES["AMPIS"]["name"],
                            "source_url": url,
                            "raw_data": cols
                        }

                        is_valid, sanitized, _ = validate_market_price(raw_item)
                        if is_valid and sanitized:
                            results.append(sanitized)

            if results:
                self._price_cache[cache_key] = {
                    "timestamp": now,
                    "data": results
                }
                self._last_ampis_fetch = now

        except Exception:
            if cache_key in self._price_cache:
                return self._price_cache[cache_key]["data"]
            return []

        return results

    def get_source_status(self) -> Dict[str, Any]:
        """Returns connection health and freshness for official market sources."""
        now = datetime.datetime.utcnow()
        kalimati_fresh = None
        if self._last_kalimati_fetch:
            kalimati_fresh = round((now - self._last_kalimati_fetch).total_seconds() / 3600.0, 1)

        ampis_fresh = None
        if self._last_ampis_fetch:
            ampis_fresh = round((now - self._last_ampis_fetch).total_seconds() / 3600.0, 1)

        return {
            "AMPIS": {
                "name": OFFICIAL_SOURCES["AMPIS"]["name"],
                "base_url": OFFICIAL_SOURCES["AMPIS"]["base_url"],
                "status": "LIVE" if ampis_fresh is not None and ampis_fresh <= 24.0 else ("RECENT" if ampis_fresh is not None else "CONNECTED"),
                "hours_since_last_fetch": ampis_fresh,
                "calculation_method": OFFICIAL_SOURCES["AMPIS"]["calculation_method"],
                "is_official": True
            },
            "KALIMATI": {
                "name": OFFICIAL_SOURCES["KALIMATI"]["name"],
                "base_url": OFFICIAL_SOURCES["KALIMATI"]["base_url"],
                "status": "LIVE" if kalimati_fresh is not None and kalimati_fresh <= 24.0 else ("RECENT" if kalimati_fresh is not None else "CONNECTED"),
                "hours_since_last_fetch": kalimati_fresh,
                "calculation_method": OFFICIAL_SOURCES["KALIMATI"]["calculation_method"],
                "is_official": True
            }
        }
