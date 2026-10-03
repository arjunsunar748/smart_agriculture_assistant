from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime
from app.database import get_db
from app.services.crops.service import crop_service
from app.services.weather.open_meteo import OpenMeteoProvider
from app.services.market.kalimati import KalimatiMarketProvider
from app.data.nepal_geo import get_district_info
from app.schemas.schemas import ShouldIPlantNowRequest, ShouldIPlantNowResponse

router = APIRouter(prefix="/decision", tags=["Planting Decision"])
weather_service = OpenMeteoProvider()
market_service = KalimatiMarketProvider()

@router.post("/should-i-plant-now", response_model=ShouldIPlantNowResponse)
async def should_i_plant_now(req: ShouldIPlantNowRequest, db: Session = Depends(get_db)):
    crop = crop_service.get_crop_by_slug(db, req.crop_slug)
    if not crop:
        crop_service.seed_initial_crops(db)
        crop = crop_service.get_crop_by_slug(db, req.crop_slug)
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop '{req.crop_slug}' not found.")

    geo = get_district_info(req.district)
    wx = await weather_service.get_current_and_forecast(geo["lat"], geo["lon"], geo["name"])
    curr = wx["current"]
    f7 = wx["forecast_7d"]

    market_trends = await market_service.get_price_trends(req.crop_slug)

    is_tunnel = req.farming_method.lower() == "tunnel"
    current_month = datetime.date.today().month

    # Check calendar
    cal_status = "neutral"
    for cal in crop.calendars:
        if cal.farming_method == ("tunnel" if is_tunnel else "open_field"):
            if current_month in (cal.best_months or []):
                cal_status = "best"
            elif current_month in (cal.acceptable_months or []):
                cal_status = "acceptable"
            elif current_month in (cal.poor_months or []):
                cal_status = "poor"
            break

    # Temperature threshold check
    eff_temp = curr["temperature"] + (3.5 if is_tunnel else 0.0)
    eff_min = curr["temp_min"] + (2.5 if is_tunnel else 0.0)

    # Risk checks
    reasons = []
    risks = []
    advice = []

    # Scoring
    score = 75.0
    if cal_status == "best":
        score += 15.0
        reasons.append("Active peak planting calendar window for your selected method.")
    elif cal_status == "acceptable":
        score += 5.0
        reasons.append("Planting window is acceptable, though outside peak timing.")
    else:
        score -= 25.0
        risks.append("Off-season calendar window; crop development will be constrained.")

    if crop.suitable_temp_min <= eff_temp <= crop.suitable_temp_max:
        score += 10.0
        reasons.append(f"Effective temperature ({eff_temp:.1f}°C) is well within the {crop.name_en} comfort zone.")
    elif eff_temp < crop.suitable_temp_min:
        score -= 15.0
        risks.append(f"Temperature ({eff_temp:.1f}°C) is below optimal range ({crop.suitable_temp_min}°C–{crop.suitable_temp_max}°C).")

    if eff_min < crop.base_temp:
        score -= 20.0
        risks.append(f"Nocturnal minimum ({eff_min:.1f}°C) risks falling below base threshold ({crop.base_temp}°C).")
        advice.append("Implement double-tunnel low hoops or thermal water containers to buffer night chilling.")
    else:
        reasons.append("Nocturnal thermal buffer safely exceeds zero-vegetation threshold.")

    if curr["humidity"] > 82.0:
        risks.append(f"High atmospheric humidity ({curr['humidity']:.0f}%) elevates fungal spore pressure.")
        advice.append("Adhere strictly to morning tunnel side-curtain rollup at 9:00 AM to purge canopy moisture.")
    else:
        reasons.append(f"Relative humidity ({curr['humidity']:.0f}%) is in a healthy vegetative range.")

    if market_trends["trend_7d_pct"] >= 0:
        reasons.append(f"Market wholesale price is robust at NPR {market_trends['current_avg_price']:.0f}/kg ({market_trends['trend_7d_pct']:+.1f}% trend).")
    else:
        risks.append(f"Recent wholesale price shows downward correction ({market_trends['trend_7d_pct']:+.1f}%).")

    advice.append("Use 25-micron silver-black plastic mulch to suppress weeds and retain root-zone warmth.")
    advice.append("Irrigate in the mid-morning (10:00 AM – 11:30 AM); avoid cold afternoon watering.")

    # Determine status
    if score >= 75.0 and len(risks) <= 1:
        status = "suitable"
        verdict_badge = "🟢"
        verdict_en = f"{crop.name_en} is SUITABLE to plant now in {req.district} ({req.farming_method.capitalize()})"
        verdict_ne = f"अहिले {req.district}मा {crop.name_ne} {req.farming_method} खेतीका लागि उपयुक्त छ"
    elif score >= 50.0:
        status = "wait"
        verdict_badge = "🟡"
        verdict_en = f"WAIT or Proceed with Caution for {crop.name_en}"
        verdict_ne = f"{crop.name_ne}का लागि केही दिन पर्खनुहोस् वा सावधानी अपनाउनुहोस्"
    else:
        status = "not_recommended"
        verdict_badge = "🔴"
        verdict_en = f"NOT RECOMMENDED to plant {crop.name_en} right now"
        verdict_ne = f"अहिले {crop.name_ne} रोप्न सिफारिस गरिँदैन"

    return ShouldIPlantNowResponse(
        crop_name_en=crop.name_en,
        crop_name_ne=crop.name_ne,
        district=req.district,
        farming_method=req.farming_method,
        planting_date=req.planting_date or datetime.date.today().isoformat(),
        status=status,
        verdict_badge=verdict_badge,
        verdict_title_en=verdict_en,
        verdict_title_ne=verdict_ne,
        overall_score=round(score, 1),
        reasons=reasons,
        potential_risks=risks,
        actionable_advice=advice,
        weather_summary={
            "temperature": curr["temperature"],
            "temp_max": curr["temp_max"],
            "temp_min": curr["temp_min"],
            "humidity": curr["humidity"],
            "forecast_7d_min_avg": round(sum(d["temp_min"] for d in f7) / max(1, len(f7)), 1)
        },
        market_summary={
            "avg_price": market_trends["current_avg_price"],
            "trend_7d_pct": market_trends["trend_7d_pct"],
            "seasonal_trend": market_trends["seasonal_trend"]
        },
        data_source="Open-Meteo Real-Time Weather + Kalimati Market Telemetry",
        last_updated=datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    )
