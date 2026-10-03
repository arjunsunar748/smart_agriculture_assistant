# Historical 12-Month Market Price Seasonality and Mandi Arrival Volume Benchmarks
# Based on Kalimati Fruit and Vegetable Market Development Board historical datasets
# and Nepal Agricultural Research Council (NARC) phenological growth stages.

OFFSEASON_MARKET_DATA = {
    "tomato": {
        "slug": "tomato",
        "name_en": "Tomato",
        "name_ne": "गोलभेडा",
        "scientific_name": "Solanum lycopersicum",
        "icon_emoji": "🍅",
        "growth_stages": {
            "seedling_min_days": 25,
            "seedling_max_days": 30,
            "vegetative_days": 35,
            "flowering_days": 25,
            "first_harvest_min_days": 90,
            "first_harvest_max_days": 115,
            "harvest_duration_days": 90,
            "harvest_frequency_days": 3
        },
        # 12-month historical average Kalimati wholesale prices (NPR/kg) [Jan=1 ... Dec=12]
        "monthly_avg_prices": {
            1: 110.0, 2: 125.0, 3: 105.0, 4: 75.0, 5: 55.0, 6: 45.0,
            7: 42.0, 8: 50.0, 9: 60.0, 10: 65.0, 11: 85.0, 12: 105.0
        },
        # 12-month relative Kalimati arrival index (100 = annual average, <60 = acute scarcity, >150 = glut)
        "monthly_arrival_index": {
            1: 35, 2: 30, 3: 50, 4: 85, 5: 120, 6: 160,
            7: 175, 8: 155, 9: 130, 10: 110, 11: 65, 12: 45
        },
        "glut_window": "July – October (Open-field monsoon flood from hill slopes)",
        "peak_scarcity_window": "December – March (Ground frost halts open fields; only plastic tunnels produce)",
        "market_gap_thesis": "Open-field tomato production in Mid-Hills ceases by late November due to ground frost (Tuzaro) and late blight. Market arrivals collapse by over 70%, creating a sustained high-price window (NPR 105–125/kg) throughout winter."
    },
    "cucumber": {
        "slug": "cucumber",
        "name_en": "Cucumber",
        "name_ne": "काँक्रो",
        "scientific_name": "Cucumis sativus",
        "icon_emoji": "🥒",
        "growth_stages": {
            "seedling_min_days": 15,
            "seedling_max_days": 20,
            "vegetative_days": 20,
            "flowering_days": 15,
            "first_harvest_min_days": 55,
            "first_harvest_max_days": 70,
            "harvest_duration_days": 45,
            "harvest_frequency_days": 2
        },
        "monthly_avg_prices": {
            1: 85.0, 2: 95.0, 3: 90.0, 4: 65.0, 5: 45.0, 6: 35.0,
            7: 30.0, 8: 35.0, 9: 50.0, 10: 60.0, 11: 95.0, 12: 110.0
        },
        "monthly_arrival_index": {
            1: 40, 2: 45, 3: 65, 4: 110, 5: 165, 6: 190,
            7: 180, 8: 150, 9: 120, 10: 95, 11: 45, 12: 30
        },
        "glut_window": "May – August (Peak summer open-field harvesting)",
        "peak_scarcity_window": "November – December (Mangsir wedding banquet demand) & February (Falgun weddings)",
        "market_gap_thesis": "Open-field vines freeze out by late October. Nepal's peak wedding banquet season (Mangsir) creates a 300% surge in slicing cucumber demand while local arrivals plummet, driving prices from NPR 35 to over NPR 100/kg."
    },
    "capsicum": {
        "slug": "capsicum",
        "name_en": "Capsicum (Sweet Pepper)",
        "name_ne": "भेडे खुर्सानी",
        "scientific_name": "Capsicum annuum var. grossum",
        "icon_emoji": "🫑",
        "growth_stages": {
            "seedling_min_days": 30,
            "seedling_max_days": 35,
            "vegetative_days": 40,
            "flowering_days": 25,
            "first_harvest_min_days": 100,
            "first_harvest_max_days": 125,
            "harvest_duration_days": 90,
            "harvest_frequency_days": 4
        },
        "monthly_avg_prices": {
            1: 145.0, 2: 155.0, 3: 135.0, 4: 95.0, 5: 75.0, 6: 60.0,
            7: 55.0, 8: 65.0, 9: 80.0, 10: 95.0, 11: 125.0, 12: 140.0
        },
        "monthly_arrival_index": {
            1: 30, 2: 35, 3: 55, 4: 90, 5: 140, 6: 170,
            7: 180, 8: 160, 9: 125, 10: 90, 11: 50, 12: 35
        },
        "glut_window": "June – August",
        "peak_scarcity_window": "December – March (Cold sensitive, outdoor fruit setting drops to zero)",
        "market_gap_thesis": "Capsicum flower buds abort at temperatures below 12°C in open fields. High walk-in tunnels maintain night heat above chilling thresholds, enabling harvest when hotel and cafe supply is severely restricted."
    },
    "chilli": {
        "slug": "chilli",
        "name_en": "Chilli (Hot Pepper)",
        "name_ne": "खुर्सानी",
        "scientific_name": "Capsicum annuum",
        "icon_emoji": "🌶️",
        "growth_stages": {
            "seedling_min_days": 30,
            "seedling_max_days": 35,
            "vegetative_days": 40,
            "flowering_days": 20,
            "first_harvest_min_days": 95,
            "first_harvest_max_days": 120,
            "harvest_duration_days": 120,
            "harvest_frequency_days": 5
        },
        "monthly_avg_prices": {
            1: 105.0, 2: 115.0, 3: 95.0, 4: 70.0, 5: 55.0, 6: 45.0,
            7: 40.0, 8: 50.0, 9: 65.0, 10: 75.0, 11: 90.0, 12: 100.0
        },
        "monthly_arrival_index": {
            1: 45, 2: 40, 3: 60, 4: 95, 5: 135, 6: 165,
            7: 170, 8: 150, 9: 120, 10: 95, 11: 65, 12: 50
        },
        "glut_window": "June – August",
        "peak_scarcity_window": "December – February (Winter dieback across hills)",
        "market_gap_thesis": "Open-field plants defoliate under winter dew and chill. Tunnels protect vegetative canopy, providing lucrative continuous harvesting throughout winter."
    },
    "cauliflower": {
        "slug": "cauliflower",
        "name_en": "Cauliflower",
        "name_ne": "काउली",
        "scientific_name": "Brassica oleracea var. botrytis",
        "icon_emoji": "🥦",
        "growth_stages": {
            "seedling_min_days": 25,
            "seedling_max_days": 30,
            "vegetative_days": 35,
            "flowering_days": 20,
            "first_harvest_min_days": 75,
            "first_harvest_max_days": 90,
            "harvest_duration_days": 30,
            "harvest_frequency_days": 3
        },
        "monthly_avg_prices": {
            1: 25.0, 2: 20.0, 3: 35.0, 4: 55.0, 5: 75.0, 6: 90.0,
            7: 110.0, 8: 120.0, 9: 105.0, 10: 85.0, 11: 45.0, 12: 30.0
        },
        "monthly_arrival_index": {
            1: 210, 2: 230, 3: 160, 4: 90, 5: 55, 6: 35,
            7: 25, 8: 30, 9: 45, 10: 75, 11: 160, 12: 195
        },
        "glut_window": "December – February (Severe market glut, prices crash to NPR 20/kg)",
        "peak_scarcity_window": "July – October (Dashain/Tihar festival, rain-shelter off-season)",
        "market_gap_thesis": "Standard winter open-field cauliflower crashes to floor prices. However, early rain-shelter plastic tunnels planted in June/July harvest into Dashain/Tihar, selling at up to NPR 120/kg (+500% price delta)."
    },
    "cabbage": {
        "slug": "cabbage",
        "name_en": "Cabbage",
        "name_ne": "बन्दा",
        "scientific_name": "Brassica oleracea var. capitata",
        "icon_emoji": "🥬",
        "growth_stages": {
            "seedling_min_days": 25,
            "seedling_max_days": 30,
            "vegetative_days": 35,
            "flowering_days": 15,
            "first_harvest_min_days": 75,
            "first_harvest_max_days": 85,
            "harvest_duration_days": 30,
            "harvest_frequency_days": 4
        },
        "monthly_avg_prices": {
            1: 20.0, 2: 18.0, 3: 25.0, 4: 35.0, 5: 45.0, 6: 55.0,
            7: 65.0, 8: 70.0, 9: 60.0, 10: 45.0, 11: 30.0, 12: 22.0
        },
        "monthly_arrival_index": {
            1: 220, 2: 240, 3: 170, 4: 100, 5: 60, 6: 40,
            7: 30, 8: 35, 9: 50, 10: 85, 11: 170, 12: 200
        },
        "glut_window": "December – February",
        "peak_scarcity_window": "July – September (Monsoon rot prevents open field)",
        "market_gap_thesis": "Rain protection shelters prevent black rot and soil splashing, capturing high monsoon pricing."
    },
    "brinjal": {
        "slug": "brinjal",
        "name_en": "Brinjal (Eggplant)",
        "name_ne": "भन्टा",
        "scientific_name": "Solanum melongena",
        "icon_emoji": "🍆",
        "growth_stages": {
            "seedling_min_days": 30,
            "seedling_max_days": 35,
            "vegetative_days": 40,
            "flowering_days": 25,
            "first_harvest_min_days": 100,
            "first_harvest_max_days": 125,
            "harvest_duration_days": 120,
            "harvest_frequency_days": 4
        },
        "monthly_avg_prices": {
            1: 75.0, 2: 80.0, 3: 65.0, 4: 45.0, 5: 35.0, 6: 30.0,
            7: 28.0, 8: 35.0, 9: 45.0, 10: 55.0, 11: 65.0, 12: 70.0
        },
        "monthly_arrival_index": {
            1: 45, 2: 40, 3: 70, 4: 110, 5: 160, 6: 185,
            7: 190, 8: 165, 9: 130, 10: 95, 11: 65, 12: 50
        },
        "glut_window": "May – August",
        "peak_scarcity_window": "December – February",
        "market_gap_thesis": "Warm-loving solanaceous crop that thrives inside solar-trapping winter tunnels."
    },
    "beans": {
        "slug": "beans",
        "name_en": "French Beans",
        "name_ne": "सिमी / बोडी",
        "scientific_name": "Phaseolus vulgaris",
        "icon_emoji": "🫘",
        "growth_stages": {
            "seedling_min_days": 0, # Direct seeded
            "seedling_max_days": 0,
            "vegetative_days": 30,
            "flowering_days": 15,
            "first_harvest_min_days": 55,
            "first_harvest_max_days": 70,
            "harvest_duration_days": 40,
            "harvest_frequency_days": 3
        },
        "monthly_avg_prices": {
            1: 125.0, 2: 135.0, 3: 95.0, 4: 65.0, 5: 50.0, 6: 45.0,
            7: 40.0, 8: 55.0, 9: 75.0, 10: 85.0, 11: 115.0, 12: 130.0
        },
        "monthly_arrival_index": {
            1: 35, 2: 30, 3: 60, 4: 105, 5: 155, 6: 180,
            7: 190, 8: 150, 9: 110, 10: 80, 11: 45, 12: 35
        },
        "glut_window": "June – August",
        "peak_scarcity_window": "November – February (Winter off-season)",
        "market_gap_thesis": "Fast-growing high-margin legume. Planting in September/October produces pods from late November through January, capturing NPR 115–135/kg wholesale."
    },
    "peas": {
        "slug": "peas",
        "name_en": "Green Peas",
        "name_ne": "केराउ (हरियो)",
        "scientific_name": "Pisum sativum",
        "icon_emoji": "🟢",
        "growth_stages": {
            "seedling_min_days": 0,
            "seedling_max_days": 0,
            "vegetative_days": 35,
            "flowering_days": 20,
            "first_harvest_min_days": 65,
            "first_harvest_max_days": 80,
            "harvest_duration_days": 35,
            "harvest_frequency_days": 3
        },
        "monthly_avg_prices": {
            1: 65.0, 2: 45.0, 3: 40.0, 4: 55.0, 5: 75.0, 6: 95.0,
            7: 115.0, 8: 135.0, 9: 145.0, 10: 165.0, 11: 150.0, 12: 110.0
        },
        "monthly_arrival_index": {
            1: 190, 2: 240, 3: 170, 4: 85, 5: 40, 6: 25,
            7: 20, 8: 20, 9: 25, 10: 35, 11: 60, 12: 120
        },
        "glut_window": "January – March (Main winter open-field harvest)",
        "peak_scarcity_window": "October – November (Early off-season luxury price)",
        "market_gap_thesis": "Early planting in September under low or walk-in tunnels hits Kathmandu wholesale 4 weeks before main open-field supplies arrive, yielding top-tier prices of NPR 150–165/kg."
    },
    "spinach": {
        "slug": "spinach",
        "name_en": "Spinach",
        "name_ne": "पालुङ्गो",
        "scientific_name": "Spinacia oleracea",
        "icon_emoji": "🍃",
        "growth_stages": {
            "seedling_min_days": 0,
            "seedling_max_days": 0,
            "vegetative_days": 25,
            "flowering_days": 0,
            "first_harvest_min_days": 30,
            "first_harvest_max_days": 42,
            "harvest_duration_days": 45,
            "harvest_frequency_days": 7
        },
        "monthly_avg_prices": {
            1: 45.0, 2: 40.0, 3: 50.0, 4: 65.0, 5: 80.0, 6: 95.0,
            7: 105.0, 8: 110.0, 9: 95.0, 10: 80.0, 11: 65.0, 12: 50.0
        },
        "monthly_arrival_index": {
            1: 180, 2: 190, 3: 140, 4: 85, 5: 50, 6: 35,
            7: 30, 8: 30, 9: 45, 10: 75, 11: 135, 12: 165
        },
        "glut_window": "December – February",
        "peak_scarcity_window": "July – September",
        "market_gap_thesis": "Tunnel keeps leaves spotless, clean of mud splashes, securing prime retail premiums."
    },
    "lettuce": {
        "slug": "lettuce",
        "name_en": "Lettuce",
        "name_ne": "सलाद पात",
        "scientific_name": "Lactuca sativa",
        "icon_emoji": "🥗",
        "growth_stages": {
            "seedling_min_days": 18,
            "seedling_max_days": 22,
            "vegetative_days": 25,
            "flowering_days": 0,
            "first_harvest_min_days": 45,
            "first_harvest_max_days": 55,
            "harvest_duration_days": 40,
            "harvest_frequency_days": 5
        },
        "monthly_avg_prices": {
            1: 95.0, 2: 90.0, 3: 85.0, 4: 95.0, 5: 115.0, 6: 135.0,
            7: 145.0, 8: 150.0, 9: 135.0, 10: 120.0, 11: 110.0, 12: 100.0
        },
        "monthly_arrival_index": {
            1: 160, 2: 170, 3: 150, 4: 95, 5: 60, 6: 40,
            7: 35, 8: 35, 9: 50, 10: 80, 11: 120, 12: 145
        },
        "glut_window": "January – March",
        "peak_scarcity_window": "June – September",
        "market_gap_thesis": "Continuous cafe demand in Kathmandu with steady off-season premiums."
    },
    "radish": {
        "slug": "radish",
        "name_en": "Radish",
        "name_ne": "मूला",
        "scientific_name": "Raphanus sativus",
        "icon_emoji": "🥕",
        "growth_stages": {
            "seedling_min_days": 0,
            "seedling_max_days": 0,
            "vegetative_days": 35,
            "flowering_days": 0,
            "first_harvest_min_days": 40,
            "first_harvest_max_days": 50,
            "harvest_duration_days": 20,
            "harvest_frequency_days": 4
        },
        "monthly_avg_prices": {
            1: 22.0, 2: 20.0, 3: 25.0, 4: 35.0, 5: 45.0, 6: 55.0,
            7: 65.0, 8: 70.0, 9: 60.0, 10: 45.0, 11: 30.0, 12: 25.0
        },
        "monthly_arrival_index": {
            1: 210, 2: 230, 3: 160, 4: 95, 5: 60, 6: 40,
            7: 35, 8: 35, 9: 55, 10: 95, 11: 170, 12: 195
        },
        "glut_window": "November – February",
        "peak_scarcity_window": "July – September",
        "market_gap_thesis": "Rain protection prevents root-rot and waterlogging during monsoon."
    },
    "carrot": {
        "slug": "carrot",
        "name_en": "Carrot",
        "name_ne": "गाजर",
        "scientific_name": "Daucus carota",
        "icon_emoji": "🥕",
        "growth_stages": {
            "seedling_min_days": 0,
            "seedling_max_days": 0,
            "vegetative_days": 65,
            "flowering_days": 0,
            "first_harvest_min_days": 80,
            "first_harvest_max_days": 95,
            "harvest_duration_days": 30,
            "harvest_frequency_days": 5
        },
        "monthly_avg_prices": {
            1: 45.0, 2: 40.0, 3: 45.0, 4: 55.0, 5: 65.0, 6: 75.0,
            7: 85.0, 8: 95.0, 9: 105.0, 10: 110.0, 11: 90.0, 12: 60.0
        },
        "monthly_arrival_index": {
            1: 190, 2: 210, 3: 180, 4: 110, 5: 75, 6: 55,
            7: 45, 8: 40, 9: 50, 10: 70, 11: 130, 12: 165
        },
        "glut_window": "January – March",
        "peak_scarcity_window": "September – November (Dashain / Tihar festive feast surge)",
        "market_gap_thesis": "Autumn tunnel carrot harvest hits peak festival demand."
    },
    "bitter-gourd": {
        "slug": "bitter-gourd",
        "name_en": "Bitter Gourd",
        "name_ne": "तीतो करेला",
        "scientific_name": "Momordica charantia",
        "icon_emoji": "🥒",
        "growth_stages": {
            "seedling_min_days": 18,
            "seedling_max_days": 22,
            "vegetative_days": 30,
            "flowering_days": 20,
            "first_harvest_min_days": 70,
            "first_harvest_max_days": 85,
            "harvest_duration_days": 60,
            "harvest_frequency_days": 3
        },
        "monthly_avg_prices": {
            1: 115.0, 2: 125.0, 3: 110.0, 4: 90.0, 5: 65.0, 6: 45.0,
            7: 40.0, 8: 45.0, 9: 65.0, 10: 80.0, 11: 100.0, 12: 115.0
        },
        "monthly_arrival_index": {
            1: 30, 2: 30, 3: 55, 4: 95, 5: 145, 6: 180,
            7: 185, 8: 160, 9: 115, 10: 80, 11: 50, 12: 35
        },
        "glut_window": "June – August",
        "peak_scarcity_window": "December – March (Extremely cold sensitive)",
        "market_gap_thesis": "Tunnel solar gain allows early spring harvesting months ahead of open fields."
    },
    "bottle-gourd": {
        "slug": "bottle-gourd",
        "name_en": "Bottle Gourd",
        "name_ne": "लौका",
        "scientific_name": "Lagenaria siceraria",
        "icon_emoji": "🥒",
        "growth_stages": {
            "seedling_min_days": 18,
            "seedling_max_days": 22,
            "vegetative_days": 30,
            "flowering_days": 20,
            "first_harvest_min_days": 70,
            "first_harvest_max_days": 85,
            "harvest_duration_days": 60,
            "harvest_frequency_days": 3
        },
        "monthly_avg_prices": {
            1: 75.0, 2: 80.0, 3: 70.0, 4: 55.0, 5: 45.0, 6: 35.0,
            7: 30.0, 8: 35.0, 9: 45.0, 10: 55.0, 11: 65.0, 12: 70.0
        },
        "monthly_arrival_index": {
            1: 45, 2: 40, 3: 70, 4: 110, 5: 160, 6: 185,
            7: 190, 8: 165, 9: 125, 10: 90, 11: 60, 12: 50
        },
        "glut_window": "June – August",
        "peak_scarcity_window": "December – February",
        "market_gap_thesis": "Early spring tunnel seedlings yield fruit in March when outdoor vines have not sprouted."
    },
    "pumpkin": {
        "slug": "pumpkin",
        "name_en": "Pumpkin",
        "name_ne": "फर्सी",
        "scientific_name": "Cucurbita moschata",
        "icon_emoji": "🎃",
        "growth_stages": {
            "seedling_min_days": 18,
            "seedling_max_days": 22,
            "vegetative_days": 40,
            "flowering_days": 25,
            "first_harvest_min_days": 90,
            "first_harvest_max_days": 110,
            "harvest_duration_days": 60,
            "harvest_frequency_days": 7
        },
        "monthly_avg_prices": {
            1: 55.0, 2: 60.0, 3: 50.0, 4: 40.0, 5: 35.0, 6: 28.0,
            7: 25.0, 8: 28.0, 9: 35.0, 10: 40.0, 11: 45.0, 12: 50.0
        },
        "monthly_arrival_index": {
            1: 60, 2: 55, 3: 85, 4: 120, 5: 160, 6: 180,
            7: 185, 8: 165, 9: 130, 10: 100, 11: 75, 12: 65
        },
        "glut_window": "June – September",
        "peak_scarcity_window": "January – March",
        "market_gap_thesis": "High demand for tender shoots (Munta) in late winter."
    },
    "okra": {
        "slug": "okra",
        "name_en": "Okra (Lady's Finger)",
        "name_ne": "भिन्डी",
        "scientific_name": "Abelmoschus esculentus",
        "icon_emoji": "🌱",
        "growth_stages": {
            "seedling_min_days": 0,
            "seedling_max_days": 0,
            "vegetative_days": 35,
            "flowering_days": 15,
            "first_harvest_min_days": 60,
            "first_harvest_max_days": 75,
            "harvest_duration_days": 60,
            "harvest_frequency_days": 2
        },
        "monthly_avg_prices": {
            1: 110.0, 2: 120.0, 3: 105.0, 4: 85.0, 5: 55.0, 6: 40.0,
            7: 35.0, 8: 40.0, 9: 55.0, 10: 75.0, 11: 95.0, 12: 110.0
        },
        "monthly_arrival_index": {
            1: 25, 2: 25, 3: 50, 4: 95, 5: 155, 6: 185,
            7: 190, 8: 165, 9: 125, 10: 85, 11: 45, 12: 30
        },
        "glut_window": "June – August",
        "peak_scarcity_window": "November – March",
        "market_gap_thesis": "Extremely heat-loving; low tunnels in early spring accelerate emergence by 40 days."
    }
}

def get_offseason_crop_data(slug: str) -> dict:
    return OFFSEASON_MARKET_DATA.get(slug, OFFSEASON_MARKET_DATA["tomato"])
