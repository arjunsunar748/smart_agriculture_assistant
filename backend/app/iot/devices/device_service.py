import datetime
from typing import List, Dict, Any, Optional
from app.iot.interfaces import IoTDeviceProvider

class FutureIoTDeviceService(IoTDeviceProvider):
    """
    Prepared device management service for future ESP32 and LoRa microcontrollers.
    Initially operates in draft/dormant mode without requiring physical hardware.
    """

    def __init__(self):
        # Simulated architecture blueprint
        self.mock_devices = [
            {
                "device_uid": "ESP32-TUNNEL-001",
                "name": "Walk-in Tunnel #1 Master Node",
                "device_type": "esp32_gateway",
                "firmware_version": "v1.2.0-beta",
                "is_active": False,
                "status_note": "Awaiting physical hardware commissioning (Separated Layer)",
                "supported_sensors": ["air_temp", "humidity", "soil_moisture"],
                "last_ping_at": None
            },
            {
                "device_uid": "ESP32-TUNNEL-002",
                "name": "Walk-in Tunnel #2 Slave Node",
                "device_type": "esp32_leaf_node",
                "firmware_version": "v1.2.0-beta",
                "is_active": False,
                "status_note": "Awaiting physical hardware commissioning (Separated Layer)",
                "supported_sensors": ["air_temp", "humidity", "co2"],
                "last_ping_at": None
            }
        ]

    async def list_devices(self, field_id: Optional[int] = None) -> List[Dict[str, Any]]:
        return self.mock_devices

    async def check_device_health(self, device_uid: str) -> Dict[str, Any]:
        dev = next((d for d in self.mock_devices if d["device_uid"] == device_uid), None)
        if not dev:
            return {
                "device_uid": device_uid,
                "status": "unregistered",
                "hardware_present": False
            }
        return {
            "device_uid": dev["device_uid"],
            "name": dev["name"],
            "is_active": dev["is_active"],
            "hardware_present": False,
            "architecture_mode": "DORMANT_RESERVED",
            "message": "Future IoT layer is decoupled from core decision engine. Zero physical hardware needed."
        }

future_iot_device_service = FutureIoTDeviceService()
