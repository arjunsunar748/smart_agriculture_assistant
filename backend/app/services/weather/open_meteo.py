import httpx
import datetime
from typing import Dict, Any, Optional
from app.services.weather.base import WeatherProvider

# WMO Weather Code Descriptions
WMO_CODE_MAP = {
    0: {"en": "Clear sky", "ne": "सफा आकाश"},
    1: {"en": "Mainly clear", "ne": "धेरैजसो सफा"},
    2: {"en": "Partly cloudy", "ne": "आंशिक बदली"},
    3: {"en": "Overcast", "ne": "पूर्ण बदली"},
    45: {"en": "Fog", "ne": "कुहिरो"},
    48: {"en": "Depositing rime fog", "ne": "बाक्लो कुहिरो"},
    51: {"en": "Light drizzle", "ne": "हल्का सिमसिमे पानी"},
    53: {"en": "Moderate drizzle", "ne": "मध्यम सिमसिमे पानी"},
    55: {"en": "Dense drizzle", "ne": "बाक्लो सिमसिमे पानी"},
    61: {"en": "Slight rain", "ne": "हल्का वर्षा"},
    63: {"en": "Moderate rain", "ne": "मध्यम वर्षा"},
    65: {"en": "Heavy rain", "ne": "भारी वर्षा"},
    71: {"en": "Slight snow fall", "ne": "हल्का हिमपात"},
    73: {"en": "Moderate snow fall", "ne": "मध्यम हिमपात"},
    75: {"en": "Heavy snow fall", "ne": "भारी हिमपात"},
    80: {"en": "Slight rain showers", "ne": "हल्का वर्षाको झरी"},
    81: {"en": "Moderate rain showers", "ne": "मध्यम वर्षाको झरी"},
    82: {"en": "Violent rain showers", "ne": "मुसलधारे वर्षा"},
    95: {"en": "Thunderstorm", "ne": "चट्याङ्गसहितको वर्षा"},
    96: {"en": "Thunderstorm with slight hail", "ne": "असिनासहितको मेघगर्जन"}
}

# In-memory weather cache: (lat, lon) -> {timestamp, data}
_WEATHER_CACHE: Dict[str, Any] = {}
CACHE_TTL_SECONDS = 900  # 15 minutes

class OpenMeteoProvider(WeatherProvider):
    def __init__(self, base_url: str = "https://api.open-meteo.com/v1"):
        self.base_url = base_url

    async def get_current_and_forecast(
        self, latitude: float, longitude: float, location_name: Optional[str] = None
    ) -> Dict[str, Any]:
        cache_key = f"{round(latitude, 2)}_{round(longitude, 2)}"
        now = datetime.datetime.utcnow()

        if cache_key in _WEATHER_CACHE:
            cached_entry = _WEATHER_CACHE[cache_key]
            if (now - cached_entry["time"]).total_seconds() < CACHE_TTL_SECONDS:
                return cached_entry["data"]

        url = f"{self.base_url}/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,wind_speed_10m",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max",
            "timezone": "auto"
        }

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    raw = response.json()
                    current = raw.get("current", {})
                    daily = raw.get("daily", {})

                    code = current.get("weather_code", 0)
                    wmo_info = WMO_CODE_MAP.get(code, {"en": "Partly cloudy", "ne": "आंशिक बदली"})

                    # Parse daily forecast
                    forecast_list = []
                    dates = daily.get("time", [])
                    t_maxes = daily.get("temperature_2m_max", [])
                    t_mins = daily.get("temperature_2m_min", [])
                    rain_sums = daily.get("precipitation_sum", [])
                    rain_probs = daily.get("precipitation_probability_max", [])
                    codes = daily.get("weather_code", [])
                    uv_maxes = daily.get("uv_index_max", [])

                    for i in range(min(7, len(dates))):
                        d_code = codes[i] if i < len(codes) else 0
                        d_wmo = WMO_CODE_MAP.get(d_code, {"en": "Partly cloudy", "ne": "आंशिक बदली"})
                        forecast_list.append({
                            "date": dates[i],
                            "temp_max": t_maxes[i] if i < len(t_maxes) else 25.0,
                            "temp_min": t_mins[i] if i < len(t_mins) else 14.0,
                            "rain_sum": rain_sums[i] if i < len(rain_sums) else 0.0,
                            "precipitation_probability_max": rain_probs[i] if i < len(rain_probs) else 0.0,
                            "weather_code": d_code,
                            "weather_description": d_wmo["en"],
                            "weather_description_ne": d_wmo["ne"],
                            "uv_index_max": uv_maxes[i] if i < len(uv_maxes) else 5.0
                        })

                    formatted = {
                        "location_name": location_name or f"Lat: {latitude}, Lon: {longitude}",
                        "district": location_name or "Nepal",
                        "latitude": latitude,
                        "longitude": longitude,
                        "elevation": raw.get("elevation", 1300.0),
                        "current": {
                            "temperature": current.get("temperature_2m", 22.0),
                            "temp_max": t_maxes[0] if t_maxes else 25.0,
                            "temp_min": t_mins[0] if t_mins else 14.0,
                            "humidity": current.get("relative_humidity_2m", 65.0),
                            "rainfall": current.get("precipitation", 0.0),
                            "rain_probability": rain_probs[0] if rain_probs else 10.0,
                            "wind_speed": current.get("wind_speed_10m", 5.0),
                            "cloud_cover": current.get("cloud_cover", 20.0),
                            "uv_index": uv_maxes[0] if uv_maxes else 5.0,
                            "weather_code": code,
                            "weather_description": wmo_info["en"],
                            "weather_description_ne": wmo_info["ne"],
                            "is_day": True,
                            "elevation": raw.get("elevation", 1300.0)
                        },
                        "forecast_7d": forecast_list,
                        "data_source": "Open-Meteo Real-Time Global Meteorological API",
                        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "status": "success",
                        "is_live": True
                    }

                    _WEATHER_CACHE[cache_key] = {"time": now, "data": formatted}
                    return formatted

        except Exception as e:
            # Fallback when network is offline / timeout
            pass

        # Return structured fallback indicating live API status
        return {
            "location_name": location_name or "Location",
            "district": location_name or "Nepal",
            "latitude": latitude,
            "longitude": longitude,
            "elevation": 1300.0,
            "current": {
                "temperature": 21.5,
                "temp_max": 26.0,
                "temp_min": 14.5,
                "humidity": 68.0,
                "rainfall": 0.0,
                "rain_probability": 15.0,
                "wind_speed": 4.5,
                "cloud_cover": 25.0,
                "uv_index": 5.2,
                "weather_code": 1,
                "weather_description": "Mainly clear (Cached Baseline)",
                "weather_description_ne": "धेरैजसो सफा",
                "is_day": True,
                "elevation": 1300.0
            },
            "forecast_7d": [
                {
                    "date": (datetime.date.today() + datetime.timedelta(days=i)).isoformat(),
                    "temp_max": 25.5 - i * 0.2,
                    "temp_min": 14.0 - i * 0.3,
                    "rain_sum": 0.0,
                    "precipitation_probability_max": 10.0,
                    "weather_code": 1,
                    "weather_description": "Mainly clear",
                    "weather_description_ne": "धेरैजसो सफा",
                    "uv_index_max": 5.0
                } for i in range(7)
            ],
            "data_source": "Weather data temporarily unavailable (Displaying seasonal baseline)",
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "cached_fallback",
            "is_live": False
        }
