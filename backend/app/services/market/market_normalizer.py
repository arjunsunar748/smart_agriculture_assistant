"""
Data Normalization Service for Agricultural Market Data in Nepal.
Converts Nepali numerals, normalizes crop names, units, and market names.
"""

import re
from typing import Optional, Tuple, Dict, Any

NEPALI_DIGITS_MAP = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
}

def nepali_to_ascii_digits(text: str) -> str:
    """Replaces Devanagari numerals with ASCII Arabic numerals."""
    if not text:
        return ""
    result = []
    for char in str(text):
        result.append(NEPALI_DIGITS_MAP.get(char, char))
    return "".join(result)

def parse_price_value(val_str: Any) -> Optional[float]:
    """Parses numeric price from strings like 'रू १००.००', '110.0', '1,200'."""
    if val_str is None:
        return None
    if isinstance(val_str, (int, float)):
        return float(val_str)
    
    clean = nepali_to_ascii_digits(str(val_str))
    # Remove currency symbol, commas, whitespace
    clean = clean.replace('रू', '').replace('रु', '').replace(',', '').strip()
    match = re.search(r'[-+]?\d*\.?\d+', clean)
    if match:
        try:
            return float(match.group(0))
        except ValueError:
            return None
    return None

def normalize_unit(unit_str: str) -> str:
    """Normalizes commodity measurement units."""
    if not unit_str:
        return "kg"
    unit_clean = nepali_to_ascii_digits(unit_str).strip().lower()
    if any(k in unit_clean for k in ['के.जी', 'केजी', 'के जी', 'kg', 'k.g', 'किलो']):
        return "kg"
    elif 'क्विन्टल' in unit_clean or 'quintal' in unit_clean:
        return "quintal"
    elif 'मुठा' in unit_clean or 'bundle' in unit_clean:
        return "bundle"
    elif 'दर्जन' in unit_clean or 'dozen' in unit_clean:
        return "dozen"
    elif 'गोटा' in unit_clean or 'piece' in unit_clean:
        return "piece"
    return "kg"

# Mapping rules from Nepali & English source commodity names to system crop slugs
CROP_NAME_MAPPINGS: Dict[str, str] = {
    # Tomato
    "गोलभेडा ठूलो(नेपाली)": "tomato",
    "गोलभेंडा ठुलो (नेपाली)": "tomato",
    "गोलभेडा ठूलो(भारतीय)": "tomato",
    "गोलभेंडा ठुलो (भारतीय)": "tomato",
    "गोलभेडा सानो(लोकल)": "tomato",
    "गोलभेंडा सानो (लोकल)": "tomato",
    "गोलभेडा सानो(टनेल)": "tomato",
    "गोलभेंडा सानो (टनेल)": "tomato",
    "गोलभेडा सानो(भारतीय)": "tomato",
    "गोलभेडा सानो(तराई)": "tomato",
    "गोलभेडा": "tomato",
    "गोलभेंडा": "tomato",
    "tomato": "tomato",

    # Cucumber
    "काँक्रो(लोकल)": "cucumber",
    "काँक्रो(हाइब्रिड)": "cucumber",
    "काँक्रो": "cucumber",
    "काक्रो": "cucumber",
    "cucumber": "cucumber",

    # Capsicum / Sweet Pepper
    "भेडे खुर्सानी": "capsicum",
    "भेडेखुर्सानी": "capsicum",
    "capsicum": "capsicum",

    # Chilli
    "खुर्सानी हरियो": "chilli",
    "खुर्सानी हरियो(माछे)": "chilli",
    "खुर्सानी हरियो(अकबरे)": "chilli",
    "खुर्सानी हरियो(बुलेट)": "chilli",
    "हरियो खुर्सानी": "chilli",
    "chilli": "chilli",

    # Cauliflower
    "काउली स्थानीय": "cauliflower",
    "काउली(स्थानीय)": "cauliflower",
    "काउली (स्थानीय)": "cauliflower",
    "काउली": "cauliflower",
    "फूलकाउली": "cauliflower",
    "cauliflower": "cauliflower",

    # Cabbage
    "बन्दा(लोकल)": "cabbage",
    "बन्दा (लोकल)": "cabbage",
    "बन्दा(तराई)": "cabbage",
    "बन्दा": "cabbage",
    "cabbage": "cabbage",

    # Brinjal / Eggplant
    "भन्टा लाम्चो": "brinjal",
    "भन्टा गोलो": "brinjal",
    "भन्टा": "brinjal",
    "brinjal": "brinjal",

    # French Beans
    "सिमी(लोकल)": "beans",
    "सिमी(घिउ)": "beans",
    "सिमी(टाटे)": "beans",
    "सिमी": "beans",
    "बोडी": "beans",
    "बोडी(तने)": "beans",
    "french_beans": "beans",
    "beans": "beans",

    # Peas
    "मटरकोशा": "peas",
    "मटर": "peas",
    "केराउ(हरियो)": "peas",
    "हरियो केराउ": "peas",
    "peas": "peas",

    # Spinach & Leafy greens
    "पालुङ्गो": "spinach",
    "पालुंगो": "spinach",
    "spinach": "spinach",
    "सलाद पात": "lettuce",
    "lettuce": "lettuce",
    "चमसुर": "spinach",

    # Radish
    "मूला सेतो(लोकल)": "radish",
    "मूला सेतो(हाइब्रिड)": "radish",
    "मूला रातो": "radish",
    "मूला": "radish",
    "radish": "radish",

    # Carrot
    "गाजर(लोकल)": "carrot",
    "गाँजर (लोकल)": "carrot",
    "गाजर(तराई)": "carrot",
    "गाजर": "carrot",
    "गाँजर": "carrot",
    "carrot": "carrot",

    # Bitter Gourd
    "तीतो करेला": "bitter-gourd",
    "तितो करेला": "bitter-gourd",
    "करेला": "bitter-gourd",
    "bitter_gourd": "bitter-gourd",
    "bitter-gourd": "bitter-gourd",

    # Bottle Gourd
    "लौका": "bottle-gourd",
    "bottle_gourd": "bottle-gourd",
    "bottle-gourd": "bottle-gourd",

    # Pumpkin
    "फर्सी पाकेको": "pumpkin",
    "फर्सी हरियो(लाम्चो)": "pumpkin",
    "फर्सी हरियो(गोलो)": "pumpkin",
    "फर्सी": "pumpkin",
    "pumpkin": "pumpkin",

    # Okra
    "भिण्डी": "okra",
    "भिन्डी": "okra",
    "okra": "okra",

    # Potato
    "आलु रातो": "potato",
    "रातो आलु (लाम्चो)": "potato",
    "रातो आलु (गोलो)": "potato",
    "आलु रातो(मुडे)": "potato",
    "आलु सेतो": "potato",
    "potato": "potato",

    # Onion
    "प्याज सुकेको (भारतीय)": "onion",
    "प्याज सुकेको (नेपाली)": "onion",
    "प्याज सुकेको": "onion",
    "onion": "onion"
}

def normalize_crop_name(name_raw: str) -> Tuple[Optional[str], str]:
    """
    Normalizes arbitrary commodity name string from Kalimati or AMPIS.
    Returns: (matched_crop_slug, display_name)
    """
    if not name_raw:
        return None, "Unknown"
    
    clean = name_raw.strip()
    # Check exact match
    if clean in CROP_NAME_MAPPINGS:
        return CROP_NAME_MAPPINGS[clean], clean
    
    # Substring matching
    lower = clean.lower()
    for pattern, slug in CROP_NAME_MAPPINGS.items():
        if pattern.lower() in lower or lower in pattern.lower():
            return slug, clean
            
    return None, clean

def normalize_market_name(market_raw: str) -> Tuple[str, str]:
    """
    Normalizes market names to (market_id, standardized_market_name).
    """
    if not market_raw:
        return "kalimati", "Kalimati Fruit and Vegetable Market (Kathmandu)"
    
    m_lower = market_raw.lower()
    if "कालीमाटी" in market_raw or "कालिमाटी" in market_raw or "kalimati" in m_lower:
        return "kalimati", "Kalimati Wholesale Market, Kathmandu"
    elif "पोखरा" in market_raw or "pokhara" in m_lower:
        return "pokhara", "Pokhara Agriculture Market, Kaski"
    elif "बुटवल" in market_raw or "butwal" in m_lower:
        return "butwal", "Butwal Agriculture Market, Rupandehi"
    elif "कोहलपुर" in market_raw or "kohalpur" in m_lower:
        return "kohalpur", "Kohalpur Agriculture Market, Banke"
    elif "धरान" in market_raw or "dharan" in m_lower:
        return "dharan", "Dharan Agriculture Market, Sunsari"
    elif "बिर्तामोड" in market_raw or "birtamod" in m_lower:
        return "birtamod", "Birtamod Agriculture Market, Jhapa"
    elif "अत्तरिया" in market_raw or "attariya" in m_lower:
        return "attariya", "Attariya Agriculture Market, Kailali"
    elif "बिरेन्द्रनगर" in market_raw or "सुर्खेत" in market_raw or "birendranagar" in m_lower:
        return "birendranagar", "Birendranagar Agriculture Market, Surkhet"
    elif "ढल्केवर" in market_raw or "dhalkebar" in m_lower:
        return "dhalkebar", "Dhalkebar Agriculture Market, Dhanusha"
    elif "लालबन्दी" in market_raw or "lalbandi" in m_lower:
        return "lalbandi", "Lalbandi Agriculture Market, Sarlahi"
    elif "कमलामाई" in market_raw or "सिन्धुली" in market_raw or "kamalamai" in m_lower:
        return "kamalamai", "Kamalamai Agriculture Market, Sindhuli"
    elif "कावासोती" in market_raw or "kawasoti" in m_lower:
        return "kawasoti", "Kawasoti Agriculture Market, Nawalpur"

    return "regional_mandi", market_raw.strip()
