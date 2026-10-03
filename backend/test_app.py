from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_and_root():
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "healthy"

    r2 = client.get("/")
    assert r2.status_code == 200
    assert "Smart" in r2.json()["app"] or "Agri" in r2.json()["app"]


def test_crops_catalog():
    res = client.get("/api/crops")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 10
    slugs = [c["slug"] for c in crops]
    assert "tomato" in slugs
    assert "cucumber" in slugs

def test_market_prices():
    res = client.get("/api/market/prices")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    assert "avg_price" in data[0]

def test_forward_plan():
    payload = {
        "planting_date": "2026-09-20",
        "district": "Kathmandu",
        "farming_method": "tunnel",
        "tunnel_area_sqm": 250.0,
        "budget_npr": 50000.0
    }
    res = client.post("/api/offseason/forward-plan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    top = data["recommendations"][0]
    assert "overall_opportunity_score" in top
    assert "scenarios" in top
    assert len(top["scenarios"]) == 3 # Conservative, Normal, High
    assert "cost_breakdown" in top
    assert "break_even_price_per_kg" in top

def test_backward_plan():
    payload = {
        "target_harvest_month": 12, # December
        "district": "Kathmandu",
        "tunnel_area_sqm": 250.0
    }
    res = client.post("/api/offseason/backward-plan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["target_harvest_month"] == 12
    assert len(data["crops"]) > 0
    assert any(c["status"] in ["window_active", "upcoming", "missed"] for c in data["crops"])

def test_what_if_simulator():
    payload = {
        "crop_slug": "tomato",
        "tunnel_area_sqm": 250.0,
        "price_change_pct": -20.0, # 20% price drop
        "yield_change_pct": 0.0,
        "cost_change_pct": 0.0
    }
    res = client.post("/api/offseason/what-if-simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "break_even_price_per_kg" in data
    assert "simulated_profit_npr" in data
    assert "profit_delta_npr" in data
    assert data["profit_delta_npr"] < 0 # Profit decreases with lower price


def test_staggered_plan():
    payload = {
        "crop_slug": "cucumber",
        "total_tunnel_area_sqm": 92.9, # 1000 sq.ft
        "area_unit": "sqft",
        "batches_count": 4,
        "first_planting_date": "2026-09-01",
        "stagger_interval_days": 14
    }
    res = client.post("/api/offseason/staggered-plan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["batches_count"] == 4
    assert len(data["batches"]) == 4
    assert data["continuous_harvest_span_days"] > 40
    assert data["total_profit_npr"] > 0

def test_year_round_plan():
    payload = {
        "tunnel_area_sqm": 250.0,
        "starting_month": 8,
        "primary_target": "max_profit"
    }
    res = client.post("/api/offseason/year-round-plan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["annual_cycles_count"] >= 3
    assert len(data["cycles"]) >= 3
    assert "Solanaceae" in data["cycles"][0]["crop_family"]
    assert "Cucurbitaceae" in data["cycles"][1]["crop_family"]

def test_crop_rotation():
    res = client.get("/api/offseason/crop-rotation/tomato")
    assert res.status_code == 200
    data = res.json()
    assert "Solanaceae" in data["current_family"]
    assert len(data["recommended_follow_crops"]) > 0
    assert len(data["unfavorable_crops_to_avoid"]) > 0

def test_post_harvest_loss():
    payload = {
        "crop_slug": "tomato",
        "expected_yield_kg": 1000.0,
        "transport_distance_km": 40.0,
        "packaging_type": "plastic_crates",
        "storage_duration_days": 2,
        "selling_price_per_kg": 85.0
    }
    res = client.post("/api/offseason/post-harvest-loss", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["sellable_yield_kg"] < 1000.0
    assert data["total_loss_pct"] > 0.0
    assert data["monetary_loss_npr"] > 0.0

def test_alerts():
    res = client.get("/api/alerts")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] >= 5
    categories = [a["category"] for a in data["alerts"]]
    assert "planting_window" in categories
    assert "weather_risk" in categories

def test_iot_dormant_status():
    res = client.get("/api/iot/status")
    assert res.status_code == 200
    data = res.json()
    assert data["is_hardware_connected"] is False
    assert data["status"] == "DORMANT_PREPARED"

    dev_res = client.get("/api/iot/devices")
    assert dev_res.status_code == 200
    assert len(dev_res.json()) >= 2

def test_ai_chat():
    payload = {
        "message": "Aile tomato lagaye December ma kasto price huna sakcha?",
        "district": "Kathmandu",
        "farming_method": "tunnel",
        "language": "ne"
    }
    res = client.post("/api/ai/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["reply"]) > 50
    assert "tomato" in data["reply"].lower() or "गोलभेडा" in data["reply"]

if __name__ == "__main__":
    tests = [
        test_health_and_root,
        test_crops_catalog,
        test_market_prices,
        test_forward_plan,
        test_backward_plan,
        test_what_if_simulator,
        test_staggered_plan,
        test_year_round_plan,
        test_crop_rotation,
        test_post_harvest_loss,
        test_alerts,
        test_iot_dormant_status,
        test_ai_chat
    ]
    print(f"Running {len(tests)} test suites...")
    passed = 0
    for t in tests:
        try:
            t()
            print(f"  [OK] {t.__name__} PASSED")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {t.__name__} FAILED: {e}")
    print(f"\n{passed}/{len(tests)} tests passed successfully!")


