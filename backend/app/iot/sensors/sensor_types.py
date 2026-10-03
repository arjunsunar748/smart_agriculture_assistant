# Supported Future IoT Sensor Catalog & Operational Thresholds for Walk-in Tunnels

SUPPORTED_SENSOR_TYPES = [
    {
        "code": "air_temp",
        "name": "Ambient Canopy Air Temperature",
        "unit": "°C",
        "hardware_sample": "DHT22 / SHT31 / DS18B20",
        "optimal_range": "15°C – 30°C",
        "description": "Measures microclimate temperature inside the plastic tunnel canopy."
    },
    {
        "code": "humidity",
        "name": "Relative Canopy Humidity (RH)",
        "unit": "%",
        "hardware_sample": "DHT22 / SHT31",
        "optimal_range": "60% – 80%",
        "description": "Critical for fungal and late blight spore germination warnings (>85% RH)."
    },
    {
        "code": "soil_moisture",
        "name": "Volumetric Soil Moisture Content",
        "unit": "%",
        "hardware_sample": "Capacitive Soil Moisture V2.0",
        "optimal_range": "40% – 70%",
        "description": "Informs precision drip fertigation scheduling beneath silver-black mulch."
    },
    {
        "code": "co2",
        "name": "Carbon Dioxide Concentration",
        "unit": "ppm",
        "hardware_sample": "MH-Z19B NDIR Sensor",
        "optimal_range": "400 – 1000 ppm",
        "description": "Monitors CO2 depletion in sealed winter tunnels during peak morning photosynthesis."
    },
    {
        "code": "par_light",
        "name": "Photosynthetically Active Radiation",
        "unit": "µmol/m²/s",
        "hardware_sample": "BH1750 / TSL2561",
        "optimal_range": "400 – 1200 µmol/m²/s",
        "description": "Calculates solar transmission through 150-micron UV polyethylene film."
    },
    {
        "code": "soil_ph",
        "name": "Soil Substrate pH",
        "unit": "pH",
        "hardware_sample": "Analog pH Electrode Probe",
        "optimal_range": "6.0 – 6.8",
        "description": "Prevents micronutrient lockup in high-tunnel solanaceous and cucurbit soils."
    },
    {
        "code": "ec",
        "name": "Electrical Conductivity (Salinity)",
        "unit": "mS/cm",
        "hardware_sample": "Analog EC Probe",
        "optimal_range": "1.2 – 2.5 mS/cm",
        "description": "Monitors fertigation salt accumulation under plastic mulch."
    },
    {
        "code": "water_level",
        "name": "Drip Reservoir Water Level",
        "unit": "cm",
        "hardware_sample": "Ultrasonic JSN-SR04T / Hydrostatic",
        "optimal_range": "20 – 200 cm",
        "description": "Ensures uninterrupted gravity drip fertigation supply."
    }
]
