"""
Official Agriculture Market Sources and Regional Mandi Registry for Nepal.
Integrates Agriculture Market Price Information System (AMPIS) and
Kalimati Fruits and Vegetable Market Development Board.
"""

from typing import Dict, Any, Optional

OFFICIAL_SOURCES = {
    "AMPIS": {
        "code": "AMPIS",
        "name": "Agriculture Market Price Information System (AMPIS)",
        "agency": "Ministry of Agriculture and Livestock Development, Government of Nepal",
        "base_url": "https://ampis.gov.np",
        "price_url": "https://ampis.gov.np/market-price-comparison",
        "commodity_url": "https://ampis.gov.np/available-commodity",
        "technical_note_url": "https://ampis.gov.np/technical-note",
        "calculation_method": "midpoint",
        "calculation_description": "Midpoint Price = (Minimum Price + Maximum Price) / 2 as per official AMPIS Technical Note",
        "primary": True,
        "is_official_government": True
    },
    "KALIMATI": {
        "code": "KALIMATI",
        "name": "Kalimati Fruits and Vegetable Market Development Board",
        "agency": "Ministry of Agriculture and Livestock Development, Government of Nepal",
        "base_url": "https://kalimatimarket.gov.np",
        "price_url": "https://kalimatimarket.gov.np/price",
        "arrival_url": "https://kalimatimarket.gov.np/daily-arrivals",
        "comparative_url": "https://kalimatimarket.gov.np/comparative-prices",
        "arrival_history_url": "https://kalimatimarket.gov.np/arrival-history",
        "calculation_method": "arithmetic_average",
        "calculation_description": "Arithmetic Mean Price = Sum of observed transaction prices / Number of observations",
        "primary": True,
        "is_official_government": True
    }
}

# Regional Wholesale Markets of Nepal recognized by AMPIS & Kalimati
REGIONAL_MARKETS: Dict[str, Dict[str, Any]] = {
    "kalimati": {
        "id": "kalimati",
        "ampis_uid": "23",
        "name_en": "Kalimati Fruit and Vegetable Market",
        "name_ne": "कालीमाटी फलफूल तथा तरकारी बजार विकास समिति",
        "district": "Kathmandu",
        "province": "Bagmati",
        "latitude": 27.6991,
        "longitude": 85.2973,
        "tier": "Central Wholesale Mandi",
        "handling_fee_per_kg": 1.2,
        "base_freight_rate_per_km_ton": 8.5, # NPR per ton-km
        "absorption_capacity": "High (multi-ton daily bulk)",
        "source_code": "KALIMATI"
    },
    "pokhara": {
        "id": "pokhara",
        "ampis_uid": "10",
        "name_en": "Pokhara Agriculture Market",
        "name_ne": "कृषि बजार व्यवस्थापन समिति, पोखरा, कास्की",
        "district": "Kaski",
        "province": "Gandaki",
        "latitude": 28.2096,
        "longitude": 83.9856,
        "tier": "Regional Wholesale Mandi",
        "handling_fee_per_kg": 1.0,
        "base_freight_rate_per_km_ton": 8.0,
        "absorption_capacity": "High (western tourism & urban hub)",
        "source_code": "AMPIS"
    },
    "butwal": {
        "id": "butwal",
        "ampis_uid": "11",
        "name_en": "Butwal Agriculture Market",
        "name_ne": "कृषि बजार व्यवस्थापन समिति, बुटवल, रुपन्देही",
        "district": "Rupandehi",
        "province": "Lumbini",
        "latitude": 27.7006,
        "longitude": 83.4484,
        "tier": "Regional Wholesale Mandi",
        "handling_fee_per_kg": 0.9,
        "base_freight_rate_per_km_ton": 7.5,
        "absorption_capacity": "Very High (Terai-Hill transit junction)",
        "source_code": "AMPIS"
    },
    "kohalpur": {
        "id": "kohalpur",
        "ampis_uid": "12",
        "name_en": "Kohalpur Agriculture Market",
        "name_ne": "कृषि बजार व्यवस्थापन समिति, कोहलपुर, बाँके",
        "district": "Banke",
        "province": "Lumbini",
        "latitude": 28.1884,
        "longitude": 81.7058,
        "tier": "Regional Wholesale Mandi",
        "handling_fee_per_kg": 0.85,
        "base_freight_rate_per_km_ton": 7.5,
        "absorption_capacity": "High (Mid-Western regional distribution hub)",
        "source_code": "AMPIS"
    },
    "dharan": {
        "id": "dharan",
        "ampis_uid": "6",
        "name_en": "Dharan Agriculture Market",
        "name_ne": "कृषि बजार व्यवस्थापन समिति, धरान, सुनसरी",
        "district": "Sunsari",
        "province": "Koshi",
        "latitude": 26.8124,
        "longitude": 87.2834,
        "tier": "Regional Wholesale Mandi",
        "handling_fee_per_kg": 0.95,
        "base_freight_rate_per_km_ton": 7.8,
        "absorption_capacity": "High (Eastern hill collection & consumer center)",
        "source_code": "AMPIS"
    },
    "birtamod": {
        "id": "birtamod",
        "ampis_uid": "5",
        "name_en": "Birtamod Agriculture Market",
        "name_ne": "कृषि बजार व्यवस्थापन समिति, बिर्तामोड, झापा",
        "district": "Jhapa",
        "province": "Koshi",
        "latitude": 26.6341,
        "longitude": 87.9946,
        "tier": "Regional Wholesale Mandi",
        "handling_fee_per_kg": 0.9,
        "base_freight_rate_per_km_ton": 7.5,
        "absorption_capacity": "High (Far-Eastern border & tea garden hub)",
        "source_code": "AMPIS"
    },
    "attariya": {
        "id": "attariya",
        "ampis_uid": "14",
        "name_en": "Attariya Agriculture Market",
        "name_ne": "कृषि बजार व्यवस्थापन समिति, अत्तरिया, कैलाली",
        "district": "Kailali",
        "province": "Sudurpashchim",
        "latitude": 28.7997,
        "longitude": 80.5606,
        "tier": "Regional Wholesale Mandi",
        "handling_fee_per_kg": 0.8,
        "base_freight_rate_per_km_ton": 7.2,
        "absorption_capacity": "Medium-High (Far-Western transit gateway)",
        "source_code": "AMPIS"
    },
    "birendranagar": {
        "id": "birendranagar",
        "ampis_uid": "13",
        "name_en": "Birendranagar Agriculture Market",
        "name_ne": "कृषि बजार व्यवस्थापन समिति, बिरेन्द्रनगर, सुर्खेत",
        "district": "Surkhet",
        "province": "Karnali",
        "latitude": 28.5983,
        "longitude": 81.6339,
        "tier": "Regional Wholesale Mandi",
        "handling_fee_per_kg": 1.1,
        "base_freight_rate_per_km_ton": 8.5,
        "absorption_capacity": "Medium (Karnali capital consumption)",
        "source_code": "AMPIS"
    },
    "dhalkebar": {
        "id": "dhalkebar",
        "ampis_uid": "7",
        "name_en": "Dhalkebar Agriculture Market",
        "name_ne": "कृषि बजार व्यवस्थापन समिति, ढल्केवर, धनुषा",
        "district": "Dhanusha",
        "province": "Madhesh",
        "latitude": 26.9682,
        "longitude": 85.9622,
        "tier": "Regional Wholesale Mandi",
        "handling_fee_per_kg": 0.8,
        "base_freight_rate_per_km_ton": 7.2,
        "absorption_capacity": "High (East-West Highway crossroads)",
        "source_code": "AMPIS"
    },
    "lalbandi": {
        "id": "lalbandi",
        "ampis_uid": "15",
        "name_en": "Lalbandi Agriculture Market",
        "name_ne": "कृषि बजार व्यवस्थापन समिति, लालबन्दी, सर्लाही",
        "district": "Sarlahi",
        "province": "Madhesh",
        "latitude": 27.0544,
        "longitude": 85.5458,
        "tier": "Production Hub Mandi",
        "handling_fee_per_kg": 0.75,
        "base_freight_rate_per_km_ton": 7.0,
        "absorption_capacity": "High (Nepal's major tomato & vegetable production belt)",
        "source_code": "AMPIS"
    }
}

def get_market_meta(market_id: str) -> Optional[Dict[str, Any]]:
    return REGIONAL_MARKETS.get(market_id.lower())

def get_freshness_state(hours_elapsed: float) -> str:
    """
    Freshness state machine according to Section 7:
    - LIVE: < 24 hours
    - RECENT: 24 to 72 hours
    - STALE: > 72 hours
    - UNAVAILABLE: no data
    """
    if hours_elapsed is None:
        return "UNAVAILABLE"
    if hours_elapsed <= 24.0:
        return "LIVE"
    elif hours_elapsed <= 72.0:
        return "RECENT"
    else:
        return "STALE"
