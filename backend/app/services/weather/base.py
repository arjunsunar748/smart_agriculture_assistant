from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class WeatherProvider(ABC):
    """Abstract base provider for weather services."""

    @abstractmethod
    async def get_current_and_forecast(self, latitude: float, longitude: float, location_name: Optional[str] = None) -> Dict[str, Any]:
        """Fetch current weather and 7-day forecast for coordinates."""
        pass
