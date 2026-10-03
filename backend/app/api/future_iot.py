from fastapi import APIRouter
from typing import Dict, Any, List
from app.iot.sensors.sensor_types import SUPPORTED_SENSOR_TYPES
from app.iot.gateway.gateway_service import future_iot_gateway

router = APIRouter(prefix="/iot", tags=["future_iot"])

@router.get("/status")
async def get_iot_status() -> Dict[str, Any]:
    """
    Returns the operational status of the IoT subsystem.
    Confirms hardware separation and zero-IoT software execution.
    """
    summary = await future_iot_gateway.get_microclimate_summary(field_id=1)
    return {
        "status": "DORMANT_PREPARED",
        "is_hardware_connected": False,
        "mode": "Pure Software Intelligence",
        "notice": "IoT integration is prepared for future implementation. The system currently operates 100% autonomously without physical sensors or microcontrollers.",
        "active_telemetry_source": "Open-Meteo Global Numerical Weather Forecast & Kalimati Mandi Archives",
        "supported_protocols": ["MQTT 3.1.1 over TLS", "HTTP POST JSON Webhooks"],
        "telemetry_fallback_active": True,
        "sensor_count_ready": len(SUPPORTED_SENSOR_TYPES)
    }

@router.get("/sensors")
async def list_supported_sensors() -> List[Dict[str, Any]]:
    """
    Returns the catalog of 8 supported future agricultural sensors
    and their microclimatic validation thresholds for walk-in tunnels.
    """
    return SUPPORTED_SENSOR_TYPES

@router.get("/devices")
async def list_prepared_devices() -> List[Dict[str, Any]]:
    """
    Returns prepared hardware specifications for future field deployment.
    """
    return [
        {
            "device_uid": "ESP32-TUNNEL-NODE-01",
            "name": "Walk-in Poly-Tunnel Central Node",
            "hardware_platform": "ESP32-WROOM-32D 38-Pin Microcontroller",
            "firmware_spec": "FreeRTOS Dual-Core C++ MicroPython / Arduino Core",
            "connectivity": "2.4GHz Wi-Fi 802.11 b/g/n + BLE 4.2 (Optional SIM800L GSM backup)",
            "power_source": "12V 20W Monocrystalline Solar Panel + 18650 Li-ion 3S Battery Pack",
            "status": "Prepared / Dormant (No Hardware Connected)",
            "target_zone": "Kathmandu High Tunnel Unit #1",
            "sensors": ["air_temp", "humidity", "soil_moisture", "par_light", "co2"]
        },
        {
            "device_uid": "ESP32-SOIL-PROBE-02",
            "name": "Sub-Mulch Multi-Depth Drip Zone Monitor",
            "hardware_platform": "ESP32-C3 RISC-V Single Core",
            "firmware_spec": "Ultra-Low Power Deep Sleep (15-minute wake interval)",
            "connectivity": "LoRa 433/868 MHz to Master Gateway",
            "power_source": "3.7V 3000mAh LiPo Battery (Estimated 14-month endurance)",
            "status": "Prepared / Dormant (No Hardware Connected)",
            "target_zone": "Root-zone sub-mulch sensor bed",
            "sensors": ["soil_temp", "soil_moisture", "soil_ph", "ec"]
        }
    ]
