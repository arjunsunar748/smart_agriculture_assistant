import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="farmer")
    preferred_language = Column(String(10), default="ne")  # 'ne' or 'en'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    profit_calculations = relationship("ProfitCalculation", back_populates="user")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False)
    province = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    municipality = Column(String(100), nullable=False)
    ward = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=1300.0)
    total_area_sqm = Column(Float, default=500.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="farms")
    fields = relationship("Field", back_populates="farm", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="farm", cascade="all, delete-orphan")


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    name = Column(String(255), nullable=False)
    farming_method = Column(String(50), default="tunnel")  # 'tunnel' or 'open_field'
    tunnel_type = Column(String(100), default="walk_in_bamboo")  # 'walk_in_bamboo', 'low_tunnel', 'polyhouse', 'open'
    area_sqm = Column(Float, default=250.0)
    plastic_spec = Column(String(100), default="150_micron_uv")
    soil_type = Column(String(100), default="sandy_loam")
    irrigation_type = Column(String(100), default="drip")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="fields")
    crop_cycles = relationship("CropCycle", back_populates="field", cascade="all, delete-orphan")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name_en = Column(String(100), nullable=False)
    name_ne = Column(String(100), nullable=False)
    scientific_name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)  # solanaceous, cucurbit, brassica, leafy, root, legume
    
    suitable_temp_min = Column(Float, nullable=False)
    suitable_temp_max = Column(Float, nullable=False)
    base_temp = Column(Float, default=10.0)
    optimal_humidity_min = Column(Float, default=60.0)
    optimal_humidity_max = Column(Float, default=80.0)
    
    soil_type = Column(String(150), default="Well-drained sandy loam")
    soil_ph_min = Column(Float, default=6.0)
    soil_ph_max = Column(Float, default=6.8)
    water_requirement = Column(String(50), default="Medium")  # Low, Medium, High
    sunlight_hours = Column(Float, default=6.0)
    
    growing_duration_days = Column(Integer, nullable=False)
    seedling_duration_days = Column(Integer, default=25)
    
    planting_seasons_tunnel = Column(String(255), nullable=False)
    planting_seasons_open = Column(String(255), nullable=False)
    harvest_seasons = Column(String(255), nullable=False)
    
    tunnel_suitability_baseline = Column(Float, default=90.0)
    open_field_suitability_baseline = Column(Float, default=70.0)
    expected_yield_kg_per_sqm = Column(Float, nullable=False)
    
    common_diseases = Column(JSON, default=list)
    common_pests = Column(JSON, default=list)
    fertilizer_requirements = Column(JSON, default=dict)
    approx_production_cost_per_sqm = Column(Float, nullable=False)
    
    description_en = Column(Text, nullable=True)
    description_ne = Column(Text, nullable=True)
    icon_emoji = Column(String(10), default="🌱")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    varieties = relationship("CropVariety", back_populates="crop", cascade="all, delete-orphan")
    calendars = relationship("CropCalendar", back_populates="crop", cascade="all, delete-orphan")


class CropVariety(Base):
    __tablename__ = "crop_varieties"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    variety_name = Column(String(150), nullable=False)
    variety_type = Column(String(50), default="hybrid")  # hybrid, open_pollinated, local
    characteristics = Column(Text, nullable=True)
    maturity_days = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    crop = relationship("Crop", back_populates="varieties")


class CropCycle(Base):
    __tablename__ = "crop_cycles"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    variety_name = Column(String(150), nullable=True)
    planting_date = Column(DateTime, nullable=False)
    expected_harvest_date = Column(DateTime, nullable=True)
    actual_harvest_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active")  # planned, active, harvested, terminated
    yield_harvested_kg = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    field = relationship("Field", back_populates="crop_cycles")
    crop = relationship("Crop")


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    location_name = Column(String(150), nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    temperature = Column(Float, nullable=False)
    temp_max = Column(Float, nullable=False)
    temp_min = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, default=0.0)
    rain_probability = Column(Float, default=0.0)
    wind_speed = Column(Float, default=0.0)
    cloud_cover = Column(Float, default=0.0)
    uv_index = Column(Float, default=0.0)
    
    data_source = Column(String(100), default="Open-Meteo API")
    raw_forecast_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop_slug = Column(String(100), nullable=True, index=True)
    crop_name = Column(String(150), nullable=False, index=True)
    crop_name_ne = Column(String(150), nullable=True)
    market_id = Column(String(100), default="kalimati", index=True)
    market_name = Column(String(150), default="Kalimati Wholesale Market, Kathmandu", index=True)
    price_date = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    avg_price = Column(Float, nullable=False)
    representative_price = Column(Float, nullable=True)
    calculation_method = Column(String(50), default="arithmetic_average")  # "arithmetic_average" or "midpoint"
    unit = Column(String(20), default="kg")
    
    trend_7d_pct = Column(Float, default=0.0)
    trend_30d_pct = Column(Float, default=0.0)
    data_source = Column(String(150), default="Kalimati Fruit and Vegetable Market Development Board")
    source_url = Column(String(255), nullable=True)
    fetched_at = Column(DateTime, default=datetime.datetime.utcnow)
    data_quality = Column(String(50), default="LIVE")  # LIVE, RECENT, HISTORICAL, VERIFIED
    is_verified = Column(Boolean, default=True)
    is_mock = Column(Boolean, default=False)
    raw_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def minimum_price(self) -> float:
        return self.min_price

    @property
    def maximum_price(self) -> float:
        return self.max_price

    @property
    def average_price(self) -> float:
        return self.avg_price

    @property
    def source(self) -> str:
        return self.data_source


class MarketArrival(Base):
    __tablename__ = "market_arrivals"

    id = Column(Integer, primary_key=True, index=True)
    crop_slug = Column(String(100), nullable=True, index=True)
    crop_name = Column(String(150), nullable=False, index=True)
    crop_name_ne = Column(String(150), nullable=True)
    market_id = Column(String(100), default="kalimati", index=True)
    market_name = Column(String(150), default="Kalimati Wholesale Market, Kathmandu", index=True)
    arrival_date = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    quantity_kg = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")
    source = Column(String(150), default="Kalimati Fruit and Vegetable Market Development Board")
    source_url = Column(String(255), default="https://kalimatimarket.gov.np/daily-arrivals")
    fetched_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class MarketSource(Base):
    __tablename__ = "market_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=True)  # AMPIS, KALIMATI
    location = Column(String(150), nullable=False)
    source_url = Column(String(255), nullable=True)
    calculation_method = Column(String(50), default="arithmetic_average")
    reliability_score = Column(Float, default=98.0)
    is_active = Column(Boolean, default=True)
    status = Column(String(50), default="LIVE")  # LIVE, RECENT, STALE, UNAVAILABLE
    last_scraped_at = Column(DateTime, nullable=True)
    records_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)



class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    location_district = Column(String(100), nullable=False)
    farming_method = Column(String(50), default="tunnel")
    land_area_sqm = Column(Float, default=500.0)
    tunnel_area_sqm = Column(Float, default=250.0)
    budget_npr = Column(Float, default=50000.0)
    recommendation_json = Column(JSON, nullable=False)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProfitCalculation(Base):
    __tablename__ = "profit_calculations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    crop_name = Column(String(100), nullable=False)
    farming_method = Column(String(50), default="tunnel")
    area_sqm = Column(Float, nullable=False)
    area_unit = Column(String(50), default="ropani")
    
    total_cost = Column(Float, nullable=False)
    expected_yield_kg = Column(Float, nullable=False)
    expected_selling_price = Column(Float, nullable=False)
    expected_revenue = Column(Float, nullable=False)
    expected_profit = Column(Float, nullable=False)
    roi_percentage = Column(Float, nullable=False)
    break_even_price = Column(Float, nullable=False)
    break_even_yield = Column(Float, nullable=False)
    
    assumptions_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profit_calculations")


class DiseaseRisk(Base):
    __tablename__ = "disease_risks"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    disease_name_en = Column(String(150), nullable=False)
    disease_name_ne = Column(String(150), nullable=True)
    pathogen_type = Column(String(50), default="fungal")  # fungal, bacterial, viral, pest
    risk_level = Column(String(50), default="Medium")  # Low, Medium, High, Extreme
    contributing_conditions = Column(JSON, default=dict)
    preventive_actions = Column(JSON, default=list)
    evaluated_at = Column(DateTime, default=datetime.datetime.utcnow)


class CropCalendar(Base):
    __tablename__ = "crop_calendars"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    farming_method = Column(String(50), default="tunnel")  # 'tunnel' or 'open_field'
    best_months = Column(JSON, default=list)        # list of month names or indices
    acceptable_months = Column(JSON, default=list)
    poor_months = Column(JSON, default=list)
    harvest_months = Column(JSON, default=list)
    notes = Column(Text, nullable=True)

    crop = relationship("Crop", back_populates="calendars")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    alert_type = Column(String(50), default="weather")  # weather, disease, market
    severity = Column(String(50), default="warning")   # info, warning, critical
    title = Column(String(255), nullable=False)
    title_ne = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    message_ne = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="alerts")


# =====================================================================
# FUTURE IoT INTEGRATION LAYER (Dormant / Prepared for Future Expansion)
# =====================================================================

class SensorType(Base):
    __tablename__ = "sensor_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "air_temp", "humidity", "soil_moisture", "co2", "par_light"
    name = Column(String(100), nullable=False)
    unit = Column(String(20), nullable=False) # e.g. "°C", "%", "ppm", "µmol/m²/s"
    description = Column(Text, nullable=True)
    min_threshold = Column(Float, nullable=True)
    max_threshold = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    readings = relationship("SensorReading", back_populates="sensor_type")


class IoTDevice(Base):
    __tablename__ = "iot_devices"

    id = Column(Integer, primary_key=True, index=True)
    device_uid = Column(String(100), unique=True, index=True, nullable=False) # e.g. "ESP32-TUNNEL-001"
    name = Column(String(150), nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    device_type = Column(String(50), default="esp32_gateway") # "esp32_gateway", "lora_node", "wifi_sensor"
    firmware_version = Column(String(50), default="v1.0.0-draft")
    is_active = Column(Boolean, default=False) # Inactive until hardware provisioned
    last_ping_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    statuses = relationship("DeviceStatus", back_populates="device", cascade="all, delete-orphan")
    readings = relationship("SensorReading", back_populates="device", cascade="all, delete-orphan")


class DeviceStatus(Base):
    __tablename__ = "device_status"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("iot_devices.id"), nullable=False)
    battery_level_pct = Column(Float, default=100.0)
    wifi_rssi_dbm = Column(Integer, default=-65)
    ip_address = Column(String(50), nullable=True)
    status_message = Column(String(255), default="Prepared for hardware deployment")
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    device = relationship("IoTDevice", back_populates="statuses")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("iot_devices.id"), nullable=False)
    sensor_type_id = Column(Integer, ForeignKey("sensor_types.id"), nullable=False)
    reading_value = Column(Float, nullable=False)
    is_anomaly = Column(Boolean, default=False)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    device = relationship("IoTDevice", back_populates="readings")
    sensor_type = relationship("SensorType", back_populates="readings")


class IoTAlert(Base):
    __tablename__ = "iot_alerts"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("iot_devices.id"), nullable=True)
    severity = Column(String(50), default="info") # info, warning, critical
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class MarketDestination(Base):
    __tablename__ = "market_destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    tier = Column(String(50), default="wholesale") # wholesale, regional, local_haat
    district = Column(String(100), nullable=False)
    avg_distance_km = Column(Float, default=15.0)
    avg_transport_cost_per_kg = Column(Float, default=2.5)
    typical_post_harvest_loss_pct = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class BacktestRecord(Base):
    __tablename__ = "backtest_records"

    id = Column(Integer, primary_key=True, index=True)
    crop_slug = Column(String(100), nullable=False, index=True)
    target_month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    actual_wholesale_price = Column(Float, nullable=False)
    production_cost = Column(Float, nullable=False)
    realized_revenue = Column(Float, nullable=False)
    net_profit = Column(Float, nullable=False)
    roi_pct = Column(Float, nullable=False)
    is_profitable = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
