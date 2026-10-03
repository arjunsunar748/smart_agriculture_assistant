"""
Data Validation Service for Agricultural Market Data in Nepal.
Enforces realistic bounds, consistent price intervals, and data quality tags.
"""

from typing import Dict, Any, Tuple, Optional
import datetime

MIN_PLAUSIBLE_PRICE = 5.0     # NPR/kg (extreme glut floor)
MAX_PLAUSIBLE_PRICE = 650.0   # NPR/kg (peak off-season luxury greens)

def validate_market_price(record: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """
    Validates a single market price record.
    Returns: (is_valid, sanitized_record, error_message)
    """
    crop_name = record.get("crop_name")
    if not crop_name:
        return False, None, "Missing crop name"

    min_p = record.get("min_price")
    max_p = record.get("max_price")
    avg_p = record.get("avg_price")
    rep_p = record.get("representative_price")
    method = record.get("calculation_method", "arithmetic_average")

    if min_p is None or max_p is None:
        return False, None, "Missing minimum or maximum price"

    try:
        min_p = float(min_p)
        max_p = float(max_p)
    except (ValueError, TypeError):
        return False, None, "Invalid numerical format for price"

    # Enforce non-negativity
    if min_p <= 0 or max_p <= 0:
        return False, None, "Price must be strictly positive"

    data_quality = "LIVE"

    # Auto-correct inverted min/max
    if min_p > max_p:
        min_p, max_p = max_p, min_p
        data_quality = "CORRECTED_INVERSION"

    # Calculate representative / average if missing
    if avg_p is None or avg_p <= 0:
        if method == "midpoint":
            avg_p = round((min_p + max_p) / 2.0, 2)
            rep_p = avg_p
        else:
            avg_p = round((min_p + max_p) / 2.0, 2)
            rep_p = avg_p
    else:
        avg_p = float(avg_p)
        if rep_p is None:
            rep_p = avg_p

    # Plausibility bounds check
    if avg_p < MIN_PLAUSIBLE_PRICE or avg_p > MAX_PLAUSIBLE_PRICE:
        data_quality = "OUTLIER_FLAGGED"

    # Date validation
    p_date = record.get("price_date")
    if not p_date:
        p_date = datetime.date.today().isoformat()
    elif isinstance(p_date, (datetime.datetime, datetime.date)):
        p_date = p_date.isoformat()

    sanitized = {
        "crop_slug": record.get("crop_slug"),
        "crop_name": str(crop_name).strip(),
        "crop_name_ne": record.get("crop_name_ne"),
        "market_id": record.get("market_id", "kalimati"),
        "market_name": record.get("market_name", "Kalimati Wholesale Market, Kathmandu"),
        "price_date": p_date,
        "min_price": round(min_p, 2),
        "max_price": round(max_p, 2),
        "avg_price": round(avg_p, 2),
        "representative_price": round(rep_p, 2) if rep_p is not None else round(avg_p, 2),
        "calculation_method": method,
        "unit": record.get("unit", "kg"),
        "trend_7d_pct": float(record.get("trend_7d_pct", 0.0)),
        "trend_30d_pct": float(record.get("trend_30d_pct", 0.0)),
        "data_source": record.get("data_source", "Government Wholesale Mandi"),
        "source_url": record.get("source_url"),
        "fetched_at": record.get("fetched_at", datetime.datetime.utcnow().isoformat()),
        "data_quality": data_quality,
        "is_verified": True,
        "is_mock": False,
        "raw_data": record.get("raw_data")
    }

    return True, sanitized, None

def validate_arrival_record(record: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """Validates an agricultural market arrival record."""
    crop_name = record.get("crop_name")
    qty = record.get("quantity_kg")
    if not crop_name:
        return False, None, "Missing crop name"
    if qty is None or float(qty) < 0:
        return False, None, "Invalid arrival quantity"

    sanitized = {
        "crop_slug": record.get("crop_slug"),
        "crop_name": str(crop_name).strip(),
        "crop_name_ne": record.get("crop_name_ne"),
        "market_id": record.get("market_id", "kalimati"),
        "market_name": record.get("market_name", "Kalimati Wholesale Market, Kathmandu"),
        "arrival_date": record.get("arrival_date", datetime.date.today().isoformat()),
        "quantity_kg": round(float(qty), 2),
        "unit": record.get("unit", "kg"),
        "source": record.get("source", "Kalimati Fruit and Vegetable Market Development Board"),
        "source_url": record.get("source_url", "https://kalimatimarket.gov.np/daily-arrivals"),
        "fetched_at": record.get("fetched_at", datetime.datetime.utcnow().isoformat())
    }
    return True, sanitized, None
