from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ProfitScenarioOut(BaseModel):
    scenario_name: str # "Conservative", "Normal", "High"
    scenario_name_ne: str
    expected_price_per_kg: float
    expected_revenue_npr: float
    estimated_profit_npr: float
    roi_pct: float
    assumption: str

class GrowthStageBreakdownOut(BaseModel):
    seedling_days_range: str
    vegetative_days: int
    flowering_days: int
    fruiting_days: int
    first_harvest_days_range: str
    production_duration_days: int
    harvest_frequency_days: int

class ItemizedCostBreakdownOut(BaseModel):
    seeds_seedlings_npr: float
    fertilizer_npr: float
    pesticides_npr: float
    labor_npr: float
    water_electricity_npr: float
    tunnel_prep_maintenance_npr: float
    transportation_packaging_npr: float
    other_costs_npr: float
    total_cost_npr: float

class ForwardCropRecommendation(BaseModel):
    crop_slug: str
    name_en: str
    name_ne: str
    icon_emoji: str
    scientific_name: str
    category: str
    
    # Timing
    planting_date: str
    expected_harvest_start: str
    expected_harvest_end: str
    harvest_window_months: str
    days_to_first_harvest: int
    growth_stages: GrowthStageBreakdownOut
    
    # Market Opportunity & Gap
    current_mandi_price: float
    historical_harvest_price_avg: float
    historical_glut_price: float
    estimated_price_range: str
    price_trend: str
    market_risk: str
    market_gap_delta_pct: float
    market_gap_detected: bool
    supply_arrival_status: str
    potential_margin_note: str
    
    # Microclimate & Structure
    tunnel_suitability_pct: float
    tunnel_suitability_reason: str
    open_field_suitability_pct: float
    
    # Opportunity Scoring
    overall_opportunity_score: float # 0 - 100
    opportunity_label: str # "HIGH", "MODERATE", "LOW"
    subscores: Dict[str, float]
    
    # Financials & Editable Costs (including Transport & Post-Harvest Loss)
    cost_breakdown: ItemizedCostBreakdownOut
    estimated_production_cost_npr: float
    expected_yield_kg: float
    post_harvest_loss_pct: float
    marketable_yield_kg: float
    transportation_cost_npr: float
    net_revenue_npr: float
    net_profit_npr: float
    net_roi_pct: float
    break_even_price_per_kg: float
    break_even_yield_kg: float
    scenarios: List[ProfitScenarioOut] # Conservative, Normal, High
    
    # Dedicated Risk Dimensions (Section 22)
    weather_risk_level: str # "Low", "Medium", "High"
    harvest_time_weather_summary: str
    disease_risk_level: str
    price_volatility_level: str
    investment_requirement_level: str
    data_confidence: str # "High", "Medium", "Low"
    
    # Qualitative & Explainability
    why_recommended: List[str]
    market_opportunity_thesis: str
    production_requirements: List[str]
    advantages: List[str]
    risks: List[str]
    assumptions: List[str]
    data_sources: List[str]
    last_updated: str

    # Core Feature Additions: Ranges, Historical Series, Logistics & Breakdown
    yield_range_str: Optional[str] = None
    net_profit_range_str: Optional[str] = None
    historical_harvest_prices: Optional[List[Dict[str, Any]]] = None
    historical_price_stats: Optional[Dict[str, Any]] = None
    current_market_trend_details: Optional[Dict[str, Any]] = None
    transport_details: Optional[Dict[str, Any]] = None
    score_breakdown: Optional[Dict[str, Any]] = None
    why_this_crop: Optional[Dict[str, Any]] = None

class WeightConfig(BaseModel):
    price_weight: float = 0.30
    timing_weight: float = 0.20
    tunnel_weight: float = 0.20
    profit_weight: float = 0.15
    demand_weight: float = 0.10
    weather_weight: float = 0.05

class ForwardPlanRequest(BaseModel):
    planting_date: Optional[str] = None # YYYY-MM-DD (defaults to today)
    province: Optional[str] = "Bagmati"
    district: str = "Kathmandu"
    municipality: Optional[str] = "Kathmandu Metropolitan City"
    ward: Optional[str] = None
    farming_method: str = "tunnel" # "tunnel", "open_field"
    tunnel_area_sqm: float = 250.0
    area_unit: Optional[str] = "sqm" # "ropani", "kattha", "sqm"
    budget_npr: float = 50000.0
    preferred_category: Optional[str] = None
    language: str = "ne"
    weights: Optional[WeightConfig] = None
    custom_cost_multiplier: Optional[float] = 1.0
    risk_profile: Optional[str] = "balanced" # "low_risk", "balanced", "high_opportunity"
    target_market: Optional[str] = "wholesale_kalimati" # "wholesale_kalimati", "regional_mandi", "local_haat"
    transport_cost_per_kg: Optional[float] = 3.5
    loss_pct: Optional[float] = 6.0

class ForwardPlanResponse(BaseModel):
    planting_date: str
    district: str
    farming_method: str
    tunnel_area_sqm: float
    risk_profile_applied: str
    target_market_applied: str
    weights_applied: WeightConfig
    recommendations: List[ForwardCropRecommendation]
    summary_en: str
    summary_ne: str
    evaluated_at: str

class BackwardPlanRequest(BaseModel):
    target_harvest_month: int # 1 to 12
    target_harvest_year: Optional[int] = 2026
    district: str = "Kathmandu"
    farming_method: str = "tunnel"
    tunnel_area_sqm: float = 250.0
    language: str = "ne"

class BackwardCropPlanItem(BaseModel):
    crop_slug: str
    name_en: str
    name_ne: str
    icon_emoji: str
    category: str
    target_harvest_month_name: str
    historical_mandi_price_at_target: float
    estimated_price_range: str
    
    required_planting_start: str
    required_planting_end: str
    growing_duration_days_range: str
    
    status: str # "window_active" (🟢), "upcoming" (🟡), "missed" (🔴)
    verdict_badge: str
    status_label_en: str
    status_label_ne: str
    days_until_planting_window: int
    
    can_tunnel_make_it_possible: bool
    tunnel_feasibility_rationale: str
    expected_profit_normal_npr: float
    roi_pct: float
    expected_yield_kg: float
    estimated_cost_npr: float
    transport_cost_npr: float
    net_profit_npr: float
    market_opportunity_summary: str

class BackwardPlanResponse(BaseModel):
    target_harvest_month: int
    target_harvest_month_name: str
    evaluated_at: str
    crops: List[BackwardCropPlanItem]
    summary_en: str
    summary_ne: str

class WhatIfSimulateRequest(BaseModel):
    crop_slug: str = "tomato"
    tunnel_area_sqm: float = 250.0
    planting_date: Optional[str] = None
    price_change_pct: float = 0.0 # e.g. -20%
    yield_change_pct: float = 0.0 # e.g. +10%
    cost_change_pct: float = 0.0  # e.g. +5%
    transport_cost_change_pct: float = 0.0 # e.g. +15%
    loss_change_pct: float = 0.0 # e.g. +2%
    post_harvest_loss_pct: Optional[float] = None
    transport_cost_per_kg: Optional[float] = None
    custom_cost_breakdown: Optional[Dict[str, float]] = None
    language: str = "ne"


class WhatIfSimulateResponse(BaseModel):
    crop_slug: str
    crop_name_en: str
    crop_name_ne: str
    icon_emoji: str
    tunnel_area_sqm: float
    planting_date: str
    expected_harvest_date: str
    harvest_month_name: str
    
    base_price_per_kg: float
    simulated_price_per_kg: float
    price_change_pct: float
    
    base_yield_kg: float
    simulated_yield_kg: float
    yield_change_pct: float
    loss_pct: float
    marketable_yield_kg: float
    
    base_cost_npr: float
    simulated_cost_npr: float
    cost_change_pct: float
    transport_cost_npr: float
    cost_breakdown: ItemizedCostBreakdownOut
    
    base_revenue_npr: float
    simulated_revenue_npr: float
    
    base_profit_npr: float
    simulated_profit_npr: float
    profit_delta_npr: float
    
    base_roi_pct: float
    simulated_roi_pct: float
    
    break_even_price_per_kg: float
    break_even_yield_kg: float
    
    sensitivity_verdict_en: str
    sensitivity_verdict_ne: str
    risk_level: str # "Low", "Medium", "High"
    disclaimer: str

class MonthMarketOpportunityItem(BaseModel):
    crop_slug: str
    name_en: str
    name_ne: str
    icon_emoji: str
    status: str # "high" (🟢), "moderate" (🟡), "low" (⚪)
    historical_avg_price: float
    estimated_price_range: str
    historical_arrival_index: int
    market_gap_note: str
    required_planting_window: str
    expected_harvest_days: str

class MonthWindowOut(BaseModel):
    month_index: int
    month_name_en: str
    month_name_ne: str
    bs_month_name: str
    opportunities: List[MonthMarketOpportunityItem]

class FutureMarketWindowsResponse(BaseModel):
    evaluated_at: str
    months: List[MonthWindowOut]

class OffseasonComparisonRequest(BaseModel):
    crop_slugs: List[str]
    district: str = "Kathmandu"
    tunnel_area_sqm: float = 250.0
    planting_date: Optional[str] = None
    language: str = "ne"

class OffseasonComparisonResponse(BaseModel):
    evaluated_at: str
    crops: List[ForwardCropRecommendation]

# =====================================================================
# STRATEGY BACKTESTING SCHEMAS (Section 25)
# =====================================================================

class YearlyBacktestItem(BaseModel):
    year: int
    planting_period: str
    harvest_period: str
    historical_mandi_price: float
    estimated_yield_kg: float
    production_cost_npr: float
    transport_loss_cost_npr: float
    gross_revenue_npr: float
    net_profit_npr: float
    roi_pct: float
    is_profitable: bool
    market_notes: str

class BacktestRequest(BaseModel):
    crop_slug: str = "tomato"
    target_harvest_month: int = 12
    tunnel_area_sqm: float = 250.0
    years_count: int = 5 # 2022 - 2026
    language: str = "ne"

class BacktestResponse(BaseModel):
    crop_slug: str
    crop_name_en: str
    crop_name_ne: str
    icon_emoji: str
    target_harvest_month: int
    target_harvest_month_name: str
    tunnel_area_sqm: float
    total_seasons: int
    profitable_seasons: int
    loss_seasons: int
    win_rate_pct: float
    avg_annual_profit_npr: float
    avg_roi_pct: float
    yearly_breakdown: List[YearlyBacktestItem]
    disclaimer: str
    evaluated_at: str

# =====================================================================
# RISK ANALYSIS & RISK PROFILES SCHEMAS (Sections 18, 21, 22)
# =====================================================================

class CropRiskDetailItem(BaseModel):
    crop_slug: str
    name_en: str
    name_ne: str
    icon_emoji: str
    overall_risk_rating: str # "Low", "Medium", "High"
    profit_potential_score: float # 0 - 100
    market_opportunity_score: float
    weather_risk_score: float
    disease_risk_score: float
    price_volatility_score: float
    investment_requirement_score: float
    price_crash_risk_verdict: str
    harvest_weather_outlook: str

class RiskAnalysisResponse(BaseModel):
    district: str
    evaluated_at: str
    active_profile: str
    crop_risks: List[CropRiskDetailItem]

# =====================================================================
# MARKET DESTINATION SELECTION SCHEMAS (Section 19)
# =====================================================================

class MarketComparisonItem(BaseModel):
    market_id: str
    market_name: str
    market_tier: str # "Wholesale", "Regional", "Local"
    distance_km: float
    expected_wholesale_price: float
    transport_cost_total_npr: float
    post_harvest_loss_pct: float
    loss_amount_npr: float
    net_revenue_npr: float
    net_profit_npr: float
    roi_pct: float
    net_market_value_per_kg: Optional[float] = None
    calculation_method: Optional[str] = "arithmetic_average"
    data_source: Optional[str] = "Official Mandi Telemetry"
    notes: str

class MarketSelectionRequest(BaseModel):
    crop_slug: str = "tomato"
    expected_yield_kg: float = 2500.0
    production_cost_npr: float = 30000.0
    district: str = "Kathmandu"
    target_month: int = 12

class MarketSelectionResponse(BaseModel):
    crop_slug: str
    crop_name_en: str
    crop_name_ne: str
    evaluated_at: str
    destinations: List[MarketComparisonItem]

# =====================================================================
# SUPPLY GAP INTELLIGENCE (Section 20)
# =====================================================================

class SupplyGapItem(BaseModel):
    crop_slug: str
    name_en: str
    name_ne: str
    icon_emoji: str
    target_period: str
    historical_arrivals_change_pct: float # e.g. -24%
    historical_price_change_pct: float    # e.g. +31%
    supply_condition_badge: str          # "Severe Scarcity", "Moderate Contraction", "Glut"
    data_label: str                      # "Historical Mandi Dataset"
    confidence: str                      # "High", "Medium"

class SupplyGapResponse(BaseModel):
    evaluated_at: str
    gaps: List[SupplyGapItem]

# =====================================================================
# SOFTWARE-BASED CROP CYCLE TRACKING (Section 32)
# =====================================================================

class CropCycleCreate(BaseModel):
    crop_slug: str
    tunnel_name: str = "Walk-in Tunnel #1"
    area_sqm: float = 250.0
    planting_date: str # YYYY-MM-DD
    target_harvest_month: Optional[int] = 12
    variety_name: Optional[str] = "Hybrid F1"
    notes: Optional[str] = None

class CropCycleItemOut(BaseModel):
    id: str
    crop_slug: str
    crop_name_en: str
    crop_name_ne: str
    icon_emoji: str
    tunnel_name: str
    area_sqm: float
    planting_date: str
    expected_harvest_start: str
    days_elapsed: int
    total_growing_days: int
    current_stage: str # "Seedling", "Vegetative", "Flowering", "Fruiting", "Ready to Harvest"
    progress_pct: float
    expected_yield_kg: float
    projected_revenue_npr: float
    status: str # "active", "harvested"
    market_window_alert: str

# =====================================================================
# SECTION 13: STAGGERED PLANTING PLANNER (Multiple Harvest Planning)
# =====================================================================

class StaggeredPlanRequest(BaseModel):
    crop_slug: str = "cucumber"
    total_tunnel_area_sqm: float = 92.9 # ~1,000 sq.ft
    area_unit: str = "sqft" # 'sqft' or 'sqm'
    batches_count: int = 4 # e.g. 2, 3, 4, 5
    first_planting_date: str = "2026-09-01"
    stagger_interval_days: int = 14 # Days between batches

class StaggeredBatchItemOut(BaseModel):
    batch_number: int
    batch_label: str
    area_sqm: float
    area_sqft: float
    planting_date: str
    expected_harvest_start: str
    expected_harvest_end: str
    harvest_duration_days: int
    expected_yield_kg: float
    market_harvest_month: str
    target_wholesale_price_npr: float
    expected_revenue_npr: float
    batch_production_cost_npr: float
    batch_net_profit_npr: float
    batch_roi_pct: float
    market_advantage: str

class StaggeredPlanResponse(BaseModel):
    crop_slug: str
    crop_name_en: str
    crop_name_ne: str
    icon_emoji: str
    total_tunnel_area_sqm: float
    total_tunnel_area_sqft: float
    batches_count: int
    stagger_interval_days: int
    batches: List[StaggeredBatchItemOut]
    total_yield_kg: float
    total_revenue_npr: float
    total_cost_npr: float
    total_profit_npr: float
    overall_roi_pct: float
    continuous_harvest_span_days: int
    harvest_start_earliest: str
    harvest_end_latest: str
    strategy_summary_en: str
    strategy_summary_ne: str
    risk_smoothing_benefits: List[str]

# =====================================================================
# SECTION 14 & 15: YEAR-ROUND 12-MONTH TUNNEL PLANNER & CROP ROTATION
# =====================================================================

class YearRoundPlanRequest(BaseModel):
    tunnel_area_sqm: float = 250.0
    starting_month: int = 1 # 1 to 12
    primary_target: str = "max_profit" # 'max_profit', 'soil_health', 'balanced'
    district: str = "Kathmandu"

class YearRoundCycleOut(BaseModel):
    cycle_index: int
    crop_slug: str
    crop_name_en: str
    crop_name_ne: str
    icon_emoji: str
    crop_family: str
    planting_month_name: str
    harvest_months_name: str
    growing_days: int
    tunnel_prep_days_after: int
    expected_yield_kg: float
    target_market_price_npr: float
    cycle_revenue_npr: float
    cycle_cost_npr: float
    cycle_profit_npr: float
    rotation_benefit: str
    market_window_rationale: str
    soil_impact: str # "Nitrogen Fixing", "High Feeder", "Moderate Feeder"

class CropRotationAdviceOut(BaseModel):
    current_crop_slug: str
    current_family: str
    recommended_follow_crops: List[Dict[str, str]]
    unfavorable_crops_to_avoid: List[Dict[str, str]]
    pathogen_break_rationale: str
    soil_remediation_tips: List[str]

class YearRoundPlanResponse(BaseModel):
    tunnel_area_sqm: float
    starting_month: int
    annual_cycles_count: int
    cycles: List[YearRoundCycleOut]
    annual_total_yield_kg: float
    annual_total_revenue_npr: float
    annual_total_cost_npr: float
    annual_net_profit_npr: float
    annual_roi_pct: float
    crop_rotation_evaluation: str
    soil_health_rating: str
    calendar_coverage_summary: str

# =====================================================================
# SECTION 12: POST-HARVEST LOSS CALCULATOR
# =====================================================================

class PostHarvestLossRequest(BaseModel):
    crop_slug: str = "tomato"
    expected_yield_kg: float = 1000.0
    transport_distance_km: float = 35.0
    packaging_type: str = "plastic_crates" # 'plastic_crates', 'bamboo_baskets', 'jute_sacks'
    storage_duration_days: int = 2
    selling_price_per_kg: float = 85.0

class PostHarvestLossResponse(BaseModel):
    crop_slug: str
    crop_name_en: str
    crop_name_ne: str
    initial_yield_kg: float
    handling_loss_pct: float
    handling_loss_kg: float
    transport_loss_pct: float
    transport_loss_kg: float
    storage_spoilage_pct: float
    storage_spoilage_kg: float
    total_loss_pct: float
    total_loss_kg: float
    sellable_yield_kg: float
    expected_gross_revenue_unadjusted: float
    realized_revenue_after_loss: float
    monetary_loss_npr: float
    mitigation_recommendations: List[str]

# =====================================================================
# SECTION 31: REAL-TIME SYSTEM ALERTS
# =====================================================================

class OffseasonAlertOut(BaseModel):
    id: str
    category: str # "planting_window", "market_opportunity", "price_volatility", "weather_risk", "disease_risk", "harvest_approaching", "target_window"
    category_label: str
    severity: str # "info", "warning", "critical"
    title: str
    title_ne: str
    message: str
    message_ne: str
    crop_slug: Optional[str] = None
    action_tab: Optional[str] = None
    created_at: str
    is_active: bool = True

class OffseasonAlertsResponse(BaseModel):
    total_count: int
    unread_critical: int
    alerts: List[OffseasonAlertOut]

