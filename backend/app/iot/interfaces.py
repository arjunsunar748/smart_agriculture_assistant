from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import datetime

class SensorDataProvider(ABC):
    """
    Abstract Interface for future IoT Sensor telemetry ingestion.
    Allows recommendation and decision engines to swap between
    external meteorological API feeds and physical tunnel sensor streams
    without altering core business logic.
    """

    @abstractmethod
    async def get_latest_reading(self, field_id: int, sensor_code: str) -> Optional[Dict[str, Any]]:
        """Retrieve most recent telemetry timestamp and value for a specific tunnel structure."""
        pass

    @abstractmethod
    async def get_microclimate_summary(self, field_id: int) -> Dict[str, Any]:
        """Retrieve aggregated 24h temperature, humidity, and soil moisture metrics."""
        pass


class IoTDeviceProvider(ABC):
    """
    Abstract Interface for device registry, firmware telemetry, and heartbeats.
    """

    @abstractmethod
    async def list_devices(self, field_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """List registered ESP32 nodes and gateways."""
        pass

    @abstractmethod
    async def check_device_health(self, device_uid: str) -> Dict[str, Any]:
        """Report battery level, Wi-Fi RSSI, and last handshake."""
        pass


class IoTReadingProvider(ABC):
    """
    Abstract Interface for reading ingestion and anomaly filtering.
    """

    @abstractmethod
    async def record_reading(
        self,
        device_uid: str,
        sensor_code: str,
        value: float,
        timestamp: Optional[datetime.datetime] = None
    ) -> Dict[str, Any]:
        """Record and validate incoming sensor telemetry."""
        pass
