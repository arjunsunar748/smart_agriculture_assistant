from app.services.weather.base import WeatherProvider
from app.services.weather.open_meteo import OpenMeteoProvider

weather_service = OpenMeteoProvider()
