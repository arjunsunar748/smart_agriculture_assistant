from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.services.crops.service import crop_service
from app.services.weather.open_meteo import OpenMeteoProvider
from app.services.market.kalimati import KalimatiMarketProvider
from app.data.nepal_geo import get_district_info
from app.schemas.schemas import CropComparisonRequest

router = APIRouter(prefix="/compare", tags=["Crop Comparison"])
weather_service = OpenMeteoProvider()
market_service = KalimatiMarketProvider()

@router.post("/crops")
async def compare_crops(req: CropComparisonRequest, db: Session = Depends(get_db)):
    if len(req.crop_slugs) < 2 or len(req.crop_slugs) > 5:
        raise HTTPException(status_code=400, detail="Please select between 2 and 5 crops for side-by-side comparison.")

    geo = get_district_info(req.district)
    wx = await weather_service.get_current_and_forecast(geo["lat"], geo["lon"], geo["name"])
    curr = wx["current"]
    temp = curr["temperature"]

    is_tunnel = req.farming_method.lower() == "tunnel"
    area = req.area_sqm

    market_prices = await market_service.get_current_prices()
    market_map = {m["crop_slug"]: m for m in market_prices}

    comparison_results = []
    for slug in req.crop_slugs:
        crop = crop_service.get_crop_by_slug(db, slug)
        if not crop:
            continue

        m_info = market_map.get(slug, {"avg_price": 75.0, "trend_7d_pct": 0.0})
        selling_price = m_info["avg_price"]

        cost = round(area * crop.approx_production_cost_per_sqm * (1.0 if is_tunnel else 0.70), 0)
        exp_yield = round(area * crop.expected_yield_kg_per_sqm * (1.1 if is_tunnel else 0.8), 1)
        revenue = round(exp_yield * selling_price, 0)
        profit = round(revenue - cost, 0)
        roi = round((profit / max(1.0, cost)) * 100.0, 1)

        # Weather suitability
        eff_temp = temp + (3.5 if is_tunnel else 0.0)
        if crop.suitable_temp_min <= eff_temp <= crop.suitable_temp_max:
            wx_suit = "High"
        elif eff_temp < crop.suitable_temp_min:
            wx_suit = "Moderate (Cool)"
        else:
            wx_suit = "Moderate (Warm)"

        # Risk
        if crop.growing_duration_days > 110:
            risk = "Medium"
        elif crop.growing_duration_days < 70:
            risk = "Low"
        else:
            risk = "Medium"

        comparison_results.append({
            "slug": crop.slug,
            "name_en": crop.name_en,
            "name_ne": crop.name_ne,
            "icon_emoji": crop.icon_emoji,
            "category": crop.category,
            "tunnel_suitability_pct": f"{crop.tunnel_suitability_baseline:.0f}%",
            "open_field_suitability_pct": f"{crop.open_field_suitability_baseline:.0f}%",
            "growing_duration_days": f"{crop.growing_duration_days} days",
            "seedling_duration_days": f"{crop.seedling_duration_days} days",
            "expected_yield_kg": f"{exp_yield:,.1f} kg",
            "production_cost_npr": f"NPR {cost:,.0f}",
            "current_market_price_npr": f"NPR {selling_price:.0f}/kg",
            "expected_revenue_npr": f"NPR {revenue:,.0f}",
            "estimated_profit_npr": f"NPR {profit:,.0f}",
            "roi_pct": f"{roi:.0f}%",
            "weather_suitability": wx_suit,
            "risk_level": risk,
            "water_requirement": crop.water_requirement,
            "key_advantage": (
                f"Fast cash turnover ({crop.growing_duration_days}d)" if crop.growing_duration_days <= 70
                else f"High gross revenue potential (NPR {revenue:,.0f})"
            )
        })

    return {
        "district": req.district,
        "farming_method": req.farming_method,
        "area_sqm": req.area_sqm,
        "disclaimer": "Factual comparison across agronomic and economic vectors. Select the crop aligning with your capital turnaround and labor availability.",
        "crops": comparison_results
    }
