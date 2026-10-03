from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.market.market_service import market_data_service
from app.services.market.backtesting import backtest_engine
from app.schemas.schemas import MarketPriceOut, MarketTrendOut, MarketArrivalOut, MarketSourceOut

router = APIRouter(prefix="/market", tags=["Market Intelligence"])

@router.get("/prices", response_model=List[MarketPriceOut])
async def get_market_prices(
    market_id: Optional[str] = Query(None, description="Optional regional market filter (kalimati, pokhara, butwal, dharan, etc.)"),
    crop_slug: Optional[str] = Query(None, description="Optional crop slug filter")
):
    """
    Fetches real online wholesale market prices from official sources (Kalimati Board & AMPIS).
    Never returns fabricated or mock data. Preserves source calculation methods.
    """
    prices = await market_data_service.get_current_prices(market_id=market_id)
    if crop_slug and crop_slug != "all":
        prices = [p for p in prices if p.get("crop_slug") == crop_slug]
    return prices

@router.get("/trends/{crop_slug}", response_model=MarketTrendOut)
async def get_market_trends(crop_slug: str):
    """
    Fetches 30-day historical price points, current trend momentum, market arrival status,
    and multi-factor future price range estimate for target harvest window.
    """
    trend_data = await market_data_service.get_price_trends(crop_slug)
    return trend_data

@router.get("/arrivals", response_model=List[MarketArrivalOut])
async def get_market_arrivals():
    """
    Fetches daily commodity arrival volumes (kg) from Kalimati wholesale market.
    Used as an empirical supply contraction/influx indicator.
    """
    arrivals = await market_data_service.get_market_arrivals()
    return arrivals

@router.get("/sources")
async def get_market_sources_status():
    """
    Returns live connectivity status, freshness, and calculation methods
    for official government sources (AMPIS & Kalimati).
    """
    return market_data_service.fetcher.get_source_status()

@router.post("/refresh")
async def refresh_market_data(db: Session = Depends(get_db)):
    """
    Triggers an on-demand backend sync from official government portals (AMPIS and Kalimati),
    validates new rows, and stores them in the persistent historical database.
    """
    stats = await market_data_service.sync_latest_market_data(db)
    return {
        "status": "success",
        "message": "Market data synchronization complete.",
        "stats": stats
    }

@router.post("/backtest")
async def run_market_backtest(
    crop_slug: str = Query("tomato", description="Crop slug to backtest"),
    eval_month: int = Query(9, description="Stand-at month (e.g. 9 for September)"),
    target_month: int = Query(12, description="Target harvest month (e.g. 12 for December)")
):
    """
    Section 17 Backtesting:
    Evaluates multi-factor future price prediction accuracy against multi-year historical wholesale records (2022-2025).
    Computes MAE, RMSE, MAPE, and Prediction Interval Coverage against a static historical baseline.
    """
    results = backtest_engine.run_backtest(crop_slug=crop_slug, eval_month=eval_month, target_month=target_month)
    return results
