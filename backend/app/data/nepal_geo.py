# Nepal Geographic Reference Data: 7 Provinces, 77 Districts, Coordinates, Elevation, and Municipalities

PROVINCES = [
    {"id": 1, "name": "Koshi Province", "name_ne": "कोशी प्रदेश", "districts": ["Morang", "Jhapa", "Sunsari", "Ilam", "Dhankuta", "Udayapur", "Sankhuwasabha", "Bhojpur", "Tehrathum", "Panchthar", "Taplejung", "Solukhumbu", "Khotang", "Okhaldhunga"]},
    {"id": 2, "name": "Madhesh Province", "name_ne": "मधेश प्रदेश", "districts": ["Dhanusha", "Parsa", "Bara", "Rautahat", "Sarlahi", "Mahottari", "Siraha", "Saptari"]},
    {"id": 3, "name": "Bagmati Province", "name_ne": "बागमती प्रदेश", "districts": ["Kathmandu", "Lalitpur", "Bhaktapur", "Kavrepalanchok", "Dhading", "Nuwakot", "Makwanpur", "Chitwan", "Sindhupalchok", "Dolakha", "Ramechhap", "Sindhuli", "Rasuwa"]},
    {"id": 4, "name": "Gandaki Province", "name_ne": "गण्डकी प्रदेश", "districts": ["Kaski", "Tanahun", "Gorkha", "Syangja", "Lamjung", "Nawalpur", "Myagdi", "Baglung", "Parbat", "Mustang", "Manang"]},
    {"id": 5, "name": "Lumbini Province", "name_ne": "लुम्बिनी प्रदेश", "districts": ["Rupandehi", "Kapilvastu", "Dang", "Banke", "Bardiya", "Palpa", "Arghakhanchi", "Gulmi", "Parasi", "Pyuthan", "Rolpa", "Eastern Rukum"]},
    {"id": 6, "name": "Karnali Province", "name_ne": "कर्णाली प्रदेश", "districts": ["Surkhet", "Salyan", "Dailekh", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Humla", "Dolpa", "Western Rukum"]},
    {"id": 7, "name": "Sudurpashchim Province", "name_ne": "सुदूरपश्चिम प्रदेश", "districts": ["Kailali", "Kanchanpur", "Dadeldhura", "Doti", "Achham", "Bajhang", "Bajura", "Baitadi", "Darchula"]}
]

DISTRICTS_DATA = {
    # Bagmati
    "Kathmandu": {
        "name_ne": "काठमाडौँ", "province_id": 3, "province_name": "Bagmati Province",
        "lat": 27.7172, "lon": 85.3240, "elevation": 1400.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Kathmandu Metropolitan", "Kirtipur", "Budhanilkantha", "Chandragiri", "Tokha", "Tarakeshwar", "Nagarjun", "Gokarneshwar", "Dakshinkali", "Shankharapur"]
    },
    "Lalitpur": {
        "name_ne": "ललितपुर", "province_id": 3, "province_name": "Bagmati Province",
        "lat": 27.6667, "lon": 85.3167, "elevation": 1350.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Lalitpur Metropolitan", "Mahalaxmi", "Godawari", "Konjyosom", "Bagmati", "Mahankal"]
    },
    "Bhaktapur": {
        "name_ne": "भक्तपुर", "province_id": 3, "province_name": "Bagmati Province",
        "lat": 27.6710, "lon": 85.4298, "elevation": 1330.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Bhaktapur", "Madhyapur Thimi", "Suryabinayak", "Changunarayan"]
    },
    "Kavrepalanchok": {
        "name_ne": "काभ्रेपलाञ्चोक", "province_id": 3, "province_name": "Bagmati Province",
        "lat": 27.5333, "lon": 85.5500, "elevation": 1450.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Banepa", "Dhulikhel", "Panauti", "Panchkhal", "Namobuddha", "Mandandeupur"]
    },
    "Dhading": {
        "name_ne": "धादिङ", "province_id": 3, "province_name": "Bagmati Province",
        "lat": 27.8667, "lon": 84.9000, "elevation": 1150.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Nilkantha", "Dhunibeshi", "Galchhi", "Gajuri", "Benighat Rorang", "Tripurasundari"]
    },
    "Nuwakot": {
        "name_ne": "नुवाकोट", "province_id": 3, "province_name": "Bagmati Province",
        "lat": 27.9167, "lon": 85.1667, "elevation": 1020.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Bidur", "Belkotgadhi", "Kakani", "Tadi", "Likhu", "Panchakanya"]
    },
    "Chitwan": {
        "name_ne": "चितवन", "province_id": 3, "province_name": "Bagmati Province",
        "lat": 27.5341, "lon": 84.4525, "elevation": 208.0, "ecological_belt": "Terai",
        "municipalities": ["Bharatpur Metropolitan", "Ratnanagar", "Khairahani", "Rapti", "Kalika", "Madi"]
    },
    "Makwanpur": {
        "name_ne": "मकवानपुर", "province_id": 3, "province_name": "Bagmati Province",
        "lat": 27.4289, "lon": 85.0322, "elevation": 850.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Hetauda Sub-Metropolitan", "Thaha", "Bhimfedi", "Manahari", "Makawanpurgadhi", "Bakaiya"]
    },
    "Sindhupalchok": {
        "name_ne": "सिन्धुपाल्चोक", "province_id": 3, "province_name": "Bagmati Province",
        "lat": 27.9500, "lon": 85.7000, "elevation": 1650.0, "ecological_belt": "High-Hills",
        "municipalities": ["Chautara Sangachokgadhi", "Melamchi", "Barhabise", "Helambu", "Panchpokhari Thangpal"]
    },
    # Gandaki
    "Kaski": {
        "name_ne": "कास्की", "province_id": 4, "province_name": "Gandaki Province",
        "lat": 28.2096, "lon": 83.9856, "elevation": 822.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Pokhara Metropolitan", "Annapurna", "Machhapuchhre", "Madi", "Rupa"]
    },
    "Tanahun": {
        "name_ne": "तनहुँ", "province_id": 4, "province_name": "Gandaki Province",
        "lat": 27.9262, "lon": 84.2500, "elevation": 720.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Byas", "Shuklagandaki", "Bhimad", "Bhanu", "Aanboo Khaireni", "Bandipur"]
    },
    "Gorkha": {
        "name_ne": "गोरखा", "province_id": 4, "province_name": "Gandaki Province",
        "lat": 28.0000, "lon": 84.6333, "elevation": 1060.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Gorkha", "Palungtar", "Shahid Lakhan", "Barpak Sulikot", "Aarughat"]
    },
    "Syangja": {
        "name_ne": "स्याङ्जा", "province_id": 4, "province_name": "Gandaki Province",
        "lat": 28.0967, "lon": 83.8756, "elevation": 1088.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Putalibazar", "Waling", "Chapakot", "Galyang", "Bhirkot"]
    },
    "Mustang": {
        "name_ne": "मुस्ताङ", "province_id": 4, "province_name": "Gandaki Province",
        "lat": 28.7833, "lon": 83.7333, "elevation": 2740.0, "ecological_belt": "High-Hills",
        "municipalities": ["Gharapjhong", "Thasang", "Baragung Muktichhetra", "Lo-Ghekar Damodarkunda", "Lomanthang"]
    },
    # Lumbini
    "Rupandehi": {
        "name_ne": "रुपन्देही", "province_id": 5, "province_name": "Lumbini Province",
        "lat": 27.5000, "lon": 83.4500, "elevation": 109.0, "ecological_belt": "Terai",
        "municipalities": ["Butwal Sub-Metropolitan", "Siddharthanagar", "Tilottama", "Sainamaina", "Devdaha", "Lumbini Sanskritik"]
    },
    "Palpa": {
        "name_ne": "पाल्पा", "province_id": 5, "province_name": "Lumbini Province",
        "lat": 27.8667, "lon": 83.5500, "elevation": 1350.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Tansen", "Rampur", "Rainadevi Chhahara", "Ribdikot", "Bagnaskali", "Rambha"]
    },
    "Dang": {
        "name_ne": "दाङ", "province_id": 5, "province_name": "Lumbini Province",
        "lat": 28.0500, "lon": 82.3000, "elevation": 600.0, "ecological_belt": "Terai",
        "municipalities": ["Ghorahi Sub-Metropolitan", "Tulsipur Sub-Metropolitan", "Lamahi", "Rapti", "Gadhawa", "Babai"]
    },
    "Banke": {
        "name_ne": "बाँके", "province_id": 5, "province_name": "Lumbini Province",
        "lat": 28.1000, "lon": 81.6167, "elevation": 144.0, "ecological_belt": "Terai",
        "municipalities": ["Nepalgunj Sub-Metropolitan", "Kohalpur", "Khajura", "Janaki", "Baijanath"]
    },
    # Karnali
    "Surkhet": {
        "name_ne": "सुर्खेत", "province_id": 6, "province_name": "Karnali Province",
        "lat": 28.6000, "lon": 81.6333, "elevation": 720.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Birendranagar", "Bheriganga", "Gurbhakot", "Panchapuri", "Barahatal"]
    },
    "Salyan": {
        "name_ne": "सल्यान", "province_id": 6, "province_name": "Karnali Province",
        "lat": 28.3667, "lon": 82.1667, "elevation": 1530.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Sharada", "Bagchaur", "Bangad Kupinde", "Kapurkot", "Chhatreshwari", "Kalimati"]
    },
    "Jumla": {
        "name_ne": "जुम्ला", "province_id": 6, "province_name": "Karnali Province",
        "lat": 29.2747, "lon": 82.1838, "elevation": 2370.0, "ecological_belt": "High-Hills",
        "municipalities": ["Chandannath", "Tatopani", "Patarasi", "Tila", "Kankasundari", "Sinja"]
    },
    # Koshi
    "Morang": {
        "name_ne": "मोरङ", "province_id": 1, "province_name": "Koshi Province",
        "lat": 26.6667, "lon": 87.4500, "elevation": 72.0, "ecological_belt": "Terai",
        "municipalities": ["Biratnagar Metropolitan", "Sundarharaicha", "Belbari", "Pathari Shanishchare", "Urlabari", "Rangeli"]
    },
    "Jhapa": {
        "name_ne": "झापा", "province_id": 1, "province_name": "Koshi Province",
        "lat": 26.6433, "lon": 87.9942, "elevation": 110.0, "ecological_belt": "Terai",
        "municipalities": ["Birtamod", "Damak", "Mechinagar", "Bhadrapur", "Arjundhara", "Kankai"]
    },
    "Dhankuta": {
        "name_ne": "धनकुटा", "province_id": 1, "province_name": "Koshi Province",
        "lat": 26.9833, "lon": 87.3333, "elevation": 1200.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Dhankuta", "Pakhribas", "Mahalaxmi", "Sangurigadhi", "Chaubise"]
    },
    "Ilam": {
        "name_ne": "इलाम", "province_id": 1, "province_name": "Koshi Province",
        "lat": 26.9111, "lon": 87.9278, "elevation": 1208.0, "ecological_belt": "Mid-Hills",
        "municipalities": ["Ilam", "Suryodaya", "Deumai", "Mai", "Rong", "Sandakpur"]
    },
    # Madhesh
    "Dhanusha": {
        "name_ne": "धनुषा", "province_id": 2, "province_name": "Madhesh Province",
        "lat": 26.7288, "lon": 85.9244, "elevation": 86.0, "ecological_belt": "Terai",
        "municipalities": ["Janakpurdham Sub-Metropolitan", "Mithila", "Dhanusadham", "Chhireshwarnath", "Ganeshman Charnath"]
    },
    "Parsa": {
        "name_ne": "पर्सा", "province_id": 2, "province_name": "Madhesh Province",
        "lat": 27.0167, "lon": 84.8667, "elevation": 80.0, "ecological_belt": "Terai",
        "municipalities": ["Birgunj Metropolitan", "Pokhariya", "Bahudaramai", "Parsagadhi"]
    },
    # Sudurpashchim
    "Kailali": {
        "name_ne": "कैलाली", "province_id": 7, "province_name": "Sudurpashchim Province",
        "lat": 28.7000, "lon": 80.6000, "elevation": 109.0, "ecological_belt": "Terai",
        "municipalities": ["Dhangadhi Sub-Metropolitan", "Tikapur", "Godawari", "Lamki Chuha", "Ghodaghodi", "Bhajani"]
    },
    "Kanchanpur": {
        "name_ne": "कञ्चनपुर", "province_id": 7, "province_name": "Sudurpashchim Province",
        "lat": 28.8333, "lon": 80.1667, "elevation": 180.0, "ecological_belt": "Terai",
        "municipalities": ["Bhimdatta", "Bedkot", "Shuklaphanta", "Krishnapur", "Punarbas", "Belauri"]
    },
    "Dadeldhura": {
        "name_ne": "डडेल्धुरा", "province_id": 7, "province_name": "Sudurpashchim Province",
        "lat": 29.3000, "lon": 80.5833, "elevation": 1750.0, "ecological_belt": "High-Hills",
        "municipalities": ["Amargadhi", "Parshuram", "Aalital", "Bhageshwar", "Navadurga"]
    }
}

def get_district_info(district_name: str) -> dict:
    normalized = district_name.strip().title()
    if normalized in DISTRICTS_DATA:
        info = DISTRICTS_DATA[normalized].copy()
        info["name"] = normalized
        return info
    # Default to Kathmandu if not found
    info = DISTRICTS_DATA["Kathmandu"].copy()
    info["name"] = "Kathmandu"
    return info
