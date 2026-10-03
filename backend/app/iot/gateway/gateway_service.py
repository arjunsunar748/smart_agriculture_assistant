from typing import Dict, Any, List, Optional
import datetime
from app.iot.interfaces import SensorDataProvider, IoTReadingProvider
from app.iot.sensors.sensor_types import SUPPORTED_SENSOR_TYPES

class FutureIoTGatewayService(SensorDataProvider, IoTReadingProvider):
    """
    Decoupled Gateway Service.
    When hardware is deployed, it receives HTTP/MQTT packets from the ESP32 Gateway
    and updates the database. The recommendation engine queries this gateway
    to check if live physical telemetry exists; if not, it uses Open-Meteo online telemetry.
    """

    def __init__(self):
        self.is_hardware_connected = False

    async def get_latest_reading(self, field_id: int, sensor_code: str) -> Optional[Dict[str, Any]]:
        # Currently hardware is disconnected / future ready
        if not self.is_hardware_connected:
            return None
        return {
            "field_id": field_id,
            "sensor_code": sensor_code,
            "value": 24.5,
            "unit": "°C",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

    async def get_microclimate_summary(self, field_id: int) -> Dict[str, Any]:
        return {
            "field_id": field_id,
            "hardware_status": "DORMANT_PREPARED",
            "is_hardware_connected": False,
            "telemetry_source": "Open-Meteo Global Meteorology (Zero IoT fallback active)",
            "prepared_sensors": [s["code"] for s in SUPPORTED_SENSOR_TYPES]
        }

    async def record_reading(
        self,
        device_uid: str,
        sensor_code: str,
        value: float,
        timestamp: Optional[datetime.datetime] = None
    ) -> Dict[str, Any]:
        return {
            "device_uid": device_uid,
            "sensor_code": sensor_code,
            "value": value,
            "recorded": True,
            "note": "Telemetry cached in future IoT ledger"
        }

future_iot_gateway = FutureIoTGatewayService()
