from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import datetime

# --- Auth & User ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    preferred_language: Optional[str] = "ne"

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    preferred_language: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# --- Farm & Field ---
class FieldCreate(BaseModel):
    name: str
    farming_method: str = "tunnel" # tunnel or open_field
    tunnel_type: str = "walk_in_bamboo"
    area_sqm: float = 250.0
    plastic_spec: str = "150_micron_uv"
    soil_type: str = "sandy_loam"
    irrigation_type: str = "drip"

class FieldOut(FieldCreate):
    id: int
    farm_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FarmCreate(BaseModel):
    name: str
    province: str
    district: str
    municipality: str
    ward: Optional[str] = None
    latitude: float
    longitude: float
    elevation_m: float = 1300.0
    total_area_sqm: float = 500.0
    fields: Optional[List[FieldCreate]] = None

class FarmOut(BaseModel):
    id: int
    name: str
    province: str
    district: str
    municipality: str
    ward: Optional[str] = None
    latitude: float
    longitude: float
    elevation_m: float
    total_area_sqm: float
    created_at: datetime.datetime
    fields: List[FieldOut] = []

    class Config:
        from_attributes = True

# --- Weather ---
class CurrentWeatherOut(BaseModel):
    temperature: float
    temp_max: float
    temp_min: float
    humidity: float
    rainfall: float
    rain_probability: float
    wind_speed: float
    cloud_cover: float
    uv_index: float
    weather_code: Optional[int] = 0
    weather_description: str
    is_day: bool = True
    elevation: Optional[float] = 1300.0

class DailyForecastOut(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    rain_sum: float
    precipitation_probability_max: float
    weather_code: int
    weather_description: str
    uv_index_max: float

class WeatherResponse(BaseModel):
    location_name: str
    district: str
    latitude: float
    longitude: float
    elevation: float
    current: CurrentWeatherOut
    forecast_7d: List[DailyForecastOut]
    data_source: str = "Open-Meteo API"
    last_updated: str
    status: str = "success"

# --- Crops ---
class CropVarietyOut(BaseModel):
    id: int
    variety_name: str
    variety_type: str
    characteristics: Optional[str]
    maturity_days: Optional[int]

    class Config:
        from_attributes = True

class CropOut(BaseModel):
    id: int
    slug: str
    name_en: str
    name_ne: str
    scientific_name: str
    category: str
    suitable_temp_min: float
    suitable_temp_max: float
    base_temp: float
    optimal_humidity_min: float
    optimal_humidity_max: float
    soil_type: str
    soil_ph_min: float
    soil_ph_max: float
    water_requirement: str
    sunlight_hours: float
    growing_duration_days: int
    seedling_duration_days: int
    planting_seasons_tunnel: str
    planting_seasons_open: str
    harvest_seasons: str
    tunnel_suitability_baseline: float
    open_field_suitability_baseline: float
    expected_yield_kg_per_sqm: float
    approx_production_cost_per_sqm: float
    icon_emoji: str
    description_en: Optional[str]
    description_ne: Optional[str]
    common_diseases: List[Dict[str, Any]] = []
    common_pests: List[Dict[str, Any]] = []
    fertilizer_requirements: Dict[str, Any] = {}

    class Config:
        from_attributes = True

# --- Market ---
class MarketPriceOut(BaseModel):
    id: Optional[int] = None
    crop_slug: Optional[str] = None
    crop_name: str
    crop_name_ne: Optional[str] = None
    market_id: Optional[str] = "kalimati"
    market_name: str
    price_date: str
    min_price: float
    max_price: float
    avg_price: float
    representative_price: Optional[float] = None
    calculation_method: Optional[str] = "arithmetic_average"
    unit: str = "kg"
    trend_7d_pct: float = 0.0
    trend_30d_pct: float = 0.0
    data_source: str
    data_quality: Optional[str] = "LIVE"
    is_verified: bool = True
    is_mock: bool = False
    last_updated: Optional[str] = None

class MarketArrivalOut(BaseModel):
    id: Optional[int] = None
    crop_slug: Optional[str] = None
    crop_name: str
    crop_name_ne: Optional[str] = None
    market_name: str
    arrival_date: str
    quantity_kg: float
    unit: str = "kg"
    source: str
    source_url: Optional[str] = None

class MarketPriceHistoryPoint(BaseModel):
    date: str
    avg_price: float
    min_price: float
    max_price: float

class MarketTrendOut(BaseModel):
    crop_name: str
    crop_name_ne: Optional[str] = None
    market_name: str
    current_avg_price: float
    trend_7d_pct: float
    trend_30d_pct: float
    trend_90d_pct: float
    seasonal_trend: str
    history_points: List[MarketPriceHistoryPoint]
    forecast_expected_price_min: float
    forecast_expected_price_max: float
    forecast_expected_price_avg: Optional[float] = None
    forecast_confidence: str  # High, Medium, Low
    forecast_price_range_str: Optional[str] = None
    historical_baseline_range_str: Optional[str] = None
    arrival_index: Optional[int] = None
    arrival_interpretation: Optional[str] = None
    today_arrival_kg: Optional[float] = None
    data_source: str
    calculation_method: Optional[str] = "arithmetic_average"
    is_mock: bool = False
    disclaimer: Optional[str] = None

class MarketSourceOut(BaseModel):
    name: str
    base_url: str
    status: str
    hours_since_last_fetch: Optional[float] = None
    calculation_method: str
    is_official: bool = True

# --- Recommendation ---
class RecommendationRequest(BaseModel):
    district: str = "Kathmandu"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    farming_method: str = "tunnel" # tunnel, open_field, or both
    land_area_sqm: float = 500.0
    tunnel_area_sqm: float = 250.0
    budget_npr: float = 50000.0
    target_market: str = "wholesale_kalimati"
    preferred_category: Optional[str] = None # solanaceous, cucurbit, brassica, leafy, root, etc.
    language: str = "ne"

class RecommendedCropOut(BaseModel):
    crop_id: int
    slug: str
    name_en: str
    name_ne: str
    scientific_name: str
    icon_emoji: str
    category: str
    suitability_score: float # 0 - 100
    overall_suitability_label: str # High, Moderate, Low
    
    # Sub-scores
    environmental_suitability: float
    seasonal_suitability: float
    market_opportunity: float
    profit_potential: float
    risk_level: str # Low, Medium, High
    
    # Agronomic metrics
    tunnel_suitability_pct: float
    open_field_suitability_pct: float
    tunnel_vs_open_reason: str
    
    planting_window: str
    growing_duration_days: int
    seedling_days: int
    expected_harvest_date: str
    
    # Financial metrics for requested area
    estimated_production_cost_npr: float
    expected_yield_kg: float
    expected_wholesale_price_npr: float
    expected_revenue_npr: float
    estimated_profit_npr: float
    roi_pct: float
    
    # Explainability
    why_recommended: List[str]
    advantages: List[str]
    risks: List[str]
    assumptions: List[str]
    data_sources: List[str]
    data_updated: str

class RecommendationResponse(BaseModel):
    district: str
    farming_method: str
    evaluated_at: str
    active_weather: CurrentWeatherOut
    recommended_crops: List[RecommendedCropOut]
    summary_ne: str
    summary_en: str

# --- "Should I Plant Now?" Decision Engine ---
class ShouldIPlantNowRequest(BaseModel):
    crop_slug: str
    district: str = "Kathmandu"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    farming_method: str = "tunnel"
    planting_date: Optional[str] = None # YYYY-MM-DD
    language: str = "ne"

class ShouldIPlantNowResponse(BaseModel):
    crop_name_en: str
    crop_name_ne: str
    district: str
    farming_method: str
    planting_date: str
    status: str # "suitable" (🟢), "wait" (🟡), "not_recommended" (🔴)
    verdict_badge: str
    verdict_title_en: str
    verdict_title_ne: str
    overall_score: float
    reasons: List[str]
    potential_risks: List[str]
    actionable_advice: List[str]
    weather_summary: Dict[str, Any]
    market_summary: Dict[str, Any]
    data_source: str
    last_updated: str

# --- Profit Calculator ---
class ProfitCalculationRequest(BaseModel):
    crop_slug: str
    farming_method: str = "tunnel"
    area_value: float = 1.0 # e.g. 1
    area_unit: str = "ropani" # ropani, bigha, kattha, aana, sqm, hectare
    custom_seed_cost: Optional[float] = None
    custom_fertilizer_cost: Optional[float] = None
    custom_labor_cost: Optional[float] = None
    custom_irrigation_cost: Optional[float] = None
    custom_electricity_cost: Optional[float] = None
    custom_tunnel_maintenance: Optional[float] = None
    custom_other_cost: Optional[float] = None
    custom_expected_yield_kg: Optional[float] = None
    custom_selling_price_per_kg: Optional[float] = None

class ProfitCalculationResponse(BaseModel):
    crop_name_en: str
    crop_name_ne: str
    farming_method: str
    area_value: float
    area_unit: str
    area_sqm: float
    
    cost_breakdown: Dict[str, float]
    total_cost: float
    expected_yield_kg: float
    expected_selling_price_per_kg: float
    expected_revenue: float
    expected_profit: float
    roi_percentage: float
    break_even_price_per_kg: float
    break_even_yield_kg: float
    assumptions_summary: List[str]

# --- Crop Comparison ---
class CropComparisonRequest(BaseModel):
    crop_slugs: List[str]
    district: str = "Kathmandu"
    farming_method: str = "tunnel"
    area_sqm: float = 500.0

# --- Disease Risk ---
class DiseaseRiskItem(BaseModel):
    pathogen_type: str # fungal, bacterial, viral, pest
    disease_name_en: str
    disease_name_ne: str
    risk_level: str # Low, Medium, High, Extreme
    contributing_conditions: List[str]
    recommended_actions: List[str]

class DiseaseRiskResponse(BaseModel):
    crop_slug: str
    crop_name_en: str
    crop_name_ne: str
    district: str
    evaluated_at: str
    current_weather: Dict[str, Any]
    overall_disease_pressure: str
    risks: List[DiseaseRiskItem]

# --- Crop Calendar ---
class MonthCalendarInfo(BaseModel):
    month_index: int # 1 to 12
    month_name_en: str
    month_name_ne: str
    bs_month_name: str
    status: str # "best", "acceptable", "poor", "harvest"

class CropCalendarOut(BaseModel):
    crop_slug: str
    crop_name_en: str
    crop_name_ne: str
    tunnel_calendar: List[MonthCalendarInfo]
    open_field_calendar: List[MonthCalendarInfo]
    notes_en: str
    notes_ne: str

# --- Alerts ---
class AlertOut(BaseModel):
    id: int
    alert_type: str
    severity: str
    title: str
    title_ne: Optional[str]
    message: str
    message_ne: Optional[str]
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- AI Chat ---
class ChatMessageRequest(BaseModel):
    message: str
    district: Optional[str] = "Kathmandu"
    farming_method: Optional[str] = "tunnel"
    language: Optional[str] = "ne"
    conversation_history: Optional[List[Dict[str, str]]] = []

class ChatMessageResponse(BaseModel):
    reply: str
    data_context_used: Dict[str, Any]
    suggested_questions: List[str]
    timestamp: str

# --- Geo ---
class MunicipalityOut(BaseModel):
    name: str
    name_ne: str

class DistrictOut(BaseModel):
    id: str
    name: str
    name_ne: str
    province_id: int
    province_name: str
    latitude: float
    longitude: float
    elevation_m: float
    ecological_belt: str # Terai, Mid-Hills, High-Hills
    municipalities: List[str]

class ProvinceOut(BaseModel):
    id: int
    name: str
    name_ne: str
    districts: List[str]
