from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.weather.open_meteo import OpenMeteoProvider
from app.data.nepal_geo import get_district_info
from app.schemas.schemas import WeatherResponse

router = APIRouter(prefix="/weather", tags=["Weather"])
weather_service = OpenMeteoProvider()

@router.get("", response_model=WeatherResponse)
async def get_weather(
    district: str = Query("Kathmandu", description="Nepal district name"),
    lat: Optional[float] = Query(None, description="Custom latitude"),
    lon: Optional[float] = Query(None, description="Custom longitude")
):
    geo = get_district_info(district)
    target_lat = lat if lat is not None else geo["lat"]
    target_lon = lon if lon is not None else geo["lon"]

    data = await weather_service.get_current_and_forecast(
        latitude=target_lat,
        longitude=target_lon,
        location_name=geo["name"]
    )
    return data
