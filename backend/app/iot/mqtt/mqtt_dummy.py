"""
MQTT Stub / Protocol Adapter for future ESP32 telemetry.
Operates asynchronously without requiring an active Mosquitto/HiveMQ broker.
"""
from typing import Dict, Any, Callable, Optional

class FutureMqttClientStub:
    def __init__(self, broker_url: str = "mqtt.agriengine.local", port: int = 1883):
        self.broker_url = broker_url
        self.port = port
        self.is_connected = False
        self.topics = [
            "agri/tunnel/+/temperature",
            "agri/tunnel/+/humidity",
            "agri/tunnel/+/soil_moisture",
            "agri/tunnel/+/co2"
        ]

    def connect(self):
        # Stub connection - no hardware required
        self.is_connected = False

    def publish_reading_stub(self, topic: str, payload: Dict[str, Any]):
        return {"status": "queued_for_future_hardware", "topic": topic}

future_mqtt_client = FutureMqttClientStub()
