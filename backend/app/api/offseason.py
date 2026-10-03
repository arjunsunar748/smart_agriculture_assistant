from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.schemas.offseason_schemas import (
    ForwardPlanRequest, ForwardPlanResponse,
    BackwardPlanRequest, BackwardPlanResponse,
    WhatIfSimulateRequest, WhatIfSimulateResponse,
    FutureMarketWindowsResponse,
    OffseasonComparisonRequest, OffseasonComparisonResponse,
    BacktestRequest, BacktestResponse,
    RiskAnalysisResponse,
    MarketSelectionRequest, MarketSelectionResponse,
    SupplyGapResponse,
    CropCycleCreate, CropCycleItemOut,
    StaggeredPlanRequest, StaggeredPlanResponse,
    YearRoundPlanRequest, YearRoundPlanResponse,
    CropRotationAdviceOut,
    PostHarvestLossRequest, PostHarvestLossResponse,
    OffseasonAlertsResponse
)
from app.services.offseason.planner import offseason_planner
from app.services.offseason.simulator import what_if_simulator
from app.data.offseason_market_data import OFFSEASON_MARKET_DATA, get_offseason_crop_data
from app.data.crops_dataset import CROPS_DATA

router = APIRouter(prefix="/offseason", tags=["offseason"])

@router.post("/forward-plan", response_model=ForwardPlanResponse)
async def forward_plan(req: ForwardPlanRequest):
    """
    Forward Crop Planning:
    Evaluate planting crops NOW in a tunnel to calculate harvest window,
    projected scarcity, market gaps, itemized costs, and 3 financial scenarios.
    """
    try:
        return await offseason_planner.forward_plan(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forward planning error: {str(e)}")

@router.post("/backward-plan", response_model=BackwardPlanResponse)
async def backward_plan(req: BackwardPlanRequest):
    """
    Reverse / Backward Crop Planning:
    Target a specific high-value harvest month and calculate the required planting window,
    determining whether the planting window is Active, Upcoming, or Missed.
    """
    try:
        return await offseason_planner.backward_plan(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backward planning error: {str(e)}")

@router.post("/what-if-simulate", response_model=WhatIfSimulateResponse)
async def what_if_simulate(req: WhatIfSimulateRequest):
    """
    Interactive Sensitivity / What-If Simulator:
    Simulates outcome with price drops (-30% to +30%), yield adjustments, and cost variations.
    Calculates break-even price and break-even yield.
    """
    try:
        return what_if_simulator.simulate(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@router.post("/compare", response_model=OffseasonComparisonResponse)
async def compare_crops_offseason(req: OffseasonComparisonRequest):
    """
    Side-by-side comparison of 2-4 crops based on future harvest opportunity.
    """
    try:
        return await offseason_planner.compare_crops_offseason(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop comparison error: {str(e)}")

@router.get("/future-market-windows", response_model=FutureMarketWindowsResponse)
async def get_future_market_windows():
    """
    12-Month Market Gap Calendar:
    Returns high-value off-season price spike windows across all 12 months for Nepal.
    """
    try:
        return offseason_planner.get_future_market_windows()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Future market windows error: {str(e)}")

@router.get("/seasonality/{crop_slug}")
async def get_crop_seasonality(crop_slug: str):
    """
    12-Month Historical Wholesale Price and Mandi Arrival Curve for a crop.
    """
    crop_meta = next((c for c in CROPS_DATA if c["slug"] == crop_slug), None)
    if not crop_meta:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    off_data = get_offseason_crop_data(crop_slug)
    
    # Format monthly curves for charting (Recharts friendly)
    chart_data = []
    month_labels = [
        ("Jan", "पुष/माघ"), ("Feb", "माघ/फागुन"), ("Mar", "फागुन/चैत"),
        ("Apr", "चैत/बैशाख"), ("May", "बैशाख/जेठ"), ("Jun", "जेठ/असार"),
        ("Jul", "असार/साउन"), ("Aug", "साउन/भदौ"), ("Sep", "भदौ/असोज"),
        ("Oct", "असोज/कार्तिक"), ("Nov", "कार्तिक/मंसिर"), ("Dec", "मंसिर/पुष")
    ]
    
    for m in range(1, 13):
        chart_data.append({
            "month_num": m,
            "month_name": month_labels[m-1][0],
            "month_name_ne": month_labels[m-1][1],
            "price_npr": off_data["monthly_avg_prices"].get(m, 0.0),
            "arrival_index": off_data["monthly_arrival_index"].get(m, 100)
        })
        
    return {
        "crop_slug": crop_slug,
        "name_en": crop_meta["name_en"],
        "name_ne": crop_meta["name_ne"],
        "icon_emoji": crop_meta["icon_emoji"],
        "growth_stages": off_data.get("growth_stages", {}),
        "glut_window": off_data.get("glut_window", ""),
        "peak_scarcity_window": off_data.get("peak_scarcity_window", ""),
        "market_gap_thesis": off_data.get("market_gap_thesis", ""),
        "monthly_curves": chart_data
    }

@router.post("/backtest", response_model=BacktestResponse)
async def run_backtest(req: BacktestRequest):
    """
    5-Year Historical Strategy Backtesting (2022 - 2026):
    Tests whether cultivating the crop for the target harvest month was profitable across historical seasons.
    """
    try:
        return offseason_planner.run_backtest(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtesting error: {str(e)}")

@router.get("/risk-analysis", response_model=RiskAnalysisResponse)
async def get_risk_analysis(
    district: str = Query("Kathmandu", description="Farmer district"),
    profile: str = Query("balanced", description="Risk profile: 'low_risk', 'balanced', or 'high_opportunity'")
):
    """
    Risk Analysis & Price Crash Risk:
    Evaluates weather risk, disease risk, price crash risk, and multi-factor scores.
    """
    try:
        return offseason_planner.get_risk_analysis(district=district, profile=profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk analysis error: {str(e)}")

@router.post("/market-selection", response_model=MarketSelectionResponse)
async def compare_market_destinations(req: MarketSelectionRequest):
    """
    Market Destination Selection:
    Compares selling at Local Haat Bazaar, Regional Mandi, and Central Kalimati Wholesale Mandi.
    """
    try:
        return offseason_planner.compare_markets(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market selection error: {str(e)}")

@router.get("/supply-demand", response_model=SupplyGapResponse)
async def get_supply_gap_analysis():
    """
    Supply Gap Intelligence:
    Identifies market contractions and historical arrival drops in wholesale markets.
    """
    try:
        return offseason_planner.get_supply_gap_analysis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supply gap analysis error: {str(e)}")

@router.get("/crop-cycles", response_model=List[CropCycleItemOut])
async def list_active_crop_cycles():
    """
    Active Crop Cycle Tracker:
    Software-based tracking of active plantings, growth progress, and harvest window readiness.
    """
    try:
        return offseason_planner.list_crop_cycles()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop cycles error: {str(e)}")

@router.post("/crop-cycles", response_model=CropCycleItemOut)
async def create_crop_cycle(req: CropCycleCreate):
    """
    Register a new active crop cycle for software monitoring.
    """
    try:
        return offseason_planner.add_crop_cycle(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Create crop cycle error: {str(e)}")

@router.delete("/crop-cycles/{cycle_id}")
async def delete_crop_cycle(cycle_id: str):
    """
    Remove an active crop cycle.
    """
    deleted = offseason_planner.delete_crop_cycle(cycle_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Crop cycle not found")
    return {"status": "success", "message": f"Cycle {cycle_id} deleted"}

@router.post("/staggered-plan", response_model=StaggeredPlanResponse)
async def staggered_planting_plan(req: StaggeredPlanRequest):
    """
    Multiple Harvest Planning / Staggered Planting Planner (Section 13):
    Splits tunnel into batches planted over time to smooth labor, extend the harvest
    window over weeks, and capture high-value market prices without glut dumping.
    """
    try:
        return offseason_planner.staggered_plan(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Staggered plan error: {str(e)}")

@router.post("/year-round-plan", response_model=YearRoundPlanResponse)
async def year_round_tunnel_plan(req: YearRoundPlanRequest):
    """
    12-Month Year-Round Tunnel Planner (Section 14 & 15):
    Sequences crops across 12 months with tunnel cleaning, soil solarization buffer,
    botanical family alternation (Crop Rotation), and market window targeting.
    """
    try:
        return offseason_planner.year_round_plan(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Year-round plan error: {str(e)}")

@router.get("/crop-rotation/{crop_slug}", response_model=CropRotationAdviceOut)
async def get_crop_rotation_advice(crop_slug: str):
    """
    Crop Rotation Intelligence (Section 15):
    Provides family-level rotation advice, pathogen breaking (Ralstonia/Fusarium/Nematodes),
    favorable successor crops (e.g. Legumes for Nitrogen fixation), and crops to avoid.
    """
    try:
        return offseason_planner.crop_rotation_advice(crop_slug)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop rotation error: {str(e)}")

@router.post("/post-harvest-loss", response_model=PostHarvestLossResponse)
async def calculate_post_harvest_loss(req: PostHarvestLossRequest):
    """
    Post-Harvest Loss Calculator (Section 12):
    Calculates handling, transportation, and storage losses by packaging type and distance.
    Returns sellable quantity and revenue impact.
    """
    try:
        return offseason_planner.calculate_post_harvest_loss(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Post-harvest loss error: {str(e)}")

@router.get("/alerts", response_model=OffseasonAlertsResponse)
async def get_offseason_alerts():
    """
    Off-Season Real-Time System Alerts (Section 31):
    Planting window opening, market opportunity approaching, price crash risk,
    weather/frost alert, disease/humidity risk, harvest approaching.
    """
    try:
        return offseason_planner.get_offseason_alerts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alerts error: {str(e)}")


