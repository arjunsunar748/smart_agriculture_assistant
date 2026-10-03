from abc import ABC, abstractmethod
from typing import Dict, Any, List

class MarketDataProvider(ABC):
    """Abstract base provider for agricultural commodity market prices."""

    @abstractmethod
    async def get_current_prices(self) -> List[Dict[str, Any]]:
        """Fetch latest wholesale prices for tracked vegetable crops."""
        pass

    @abstractmethod
    async def get_price_trends(self, crop_slug: str) -> Dict[str, Any]:
        """Fetch historical price trend and ML forecast for a specific crop."""
        pass
