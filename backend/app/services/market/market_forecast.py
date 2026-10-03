"""
Multi-Factor Future Market Price Prediction Engine for Nepalese Vegetables.
Implements Sections 9, 10, 11, 15, and 16:
- Never uses today's price directly as future price
- Blends: Current Online Price + Historical Seasonality + Arrival Supply Contraction + Current Trend + Harvest Window
- Quantifies confidence, price risk, and compares against historical baseline
"""

import datetime
from typing import Dict, Any, Optional, Tuple

MONTH_NAMES_EN = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December"
}

def estimate_future_price_range(
    crop_slug: str,
    current_price: float,
    current_price_date: str,
    planting_date: datetime.date,
    growing_duration_days: int,
    monthly_historical_prices: Dict[int, float],
    monthly_arrival_index: Dict[int, int],
    trend_7d_pct: float = 0.0,
    trend_30d_pct: float = 0.0,
    arrival_kg_today: Optional[float] = None,
    data_freshness_state: str = "LIVE",
    source_name: str = "Official Mandi Telemetry"
) -> Dict[str, Any]:
    """
    Computes future price range for harvest window.
    DO NOT USE TODAY'S PRICE DIRECTLY AS FUTURE PRICE.
    """
    # 1. Calculate Expected Harvest Period
    first_harvest_date = planting_date + datetime.timedelta(days=int(growing_duration_days * 0.90))
    peak_harvest_date = planting_date + datetime.timedelta(days=growing_duration_days)
    end_harvest_date = planting_date + datetime.timedelta(days=int(growing_duration_days * 1.30))

    start_m = first_harvest_date.month
    end_m = end_harvest_date.month

    # 2. Historical Monthly Baseline for Harvest Window
    hist_p_start = monthly_historical_prices.get(start_m, current_price)
    hist_p_end = monthly_historical_prices.get(end_m, current_price)
    hist_harvest_baseline = round((hist_p_start + hist_p_end) / 2.0, 1)

    # Historical Current Month Price
    curr_m = planting_date.month
    hist_p_curr = monthly_historical_prices.get(curr_m, current_price)

    # 3. Seasonal Multiplier
    # Measures the natural seasonal expansion or contraction between planting month and harvest month
    seasonal_multiplier = round(hist_harvest_baseline / max(10.0, hist_p_curr), 3)

    # 4. Supply Arrival Telemetry Factor
    arr_idx_start = monthly_arrival_index.get(start_m, 100)
    arr_idx_end = monthly_arrival_index.get(end_m, 100)
    avg_arr_idx = int((arr_idx_start + arr_idx_end) / 2)

    supply_adjustment = 1.0
    if avg_arr_idx <= 45:
        # Severe supply contraction (open field harvest ceases due to cold/rain)
        supply_adjustment = 1.08
        arrival_interpretation = f"Severe Contraction (Index: {avg_arr_idx}/100) - Open-field production stops; strong off-season supply deficit."
        price_risk = "Low"
    elif avg_arr_idx <= 75:
        supply_adjustment = 1.03
        arrival_interpretation = f"Below Peak Supply (Index: {avg_arr_idx}/100) - Moderate supply tightening creates premium window."
        price_risk = "Medium"
    elif avg_arr_idx <= 110:
        supply_adjustment = 0.98
        arrival_interpretation = f"Balanced Supply (Index: {avg_arr_idx}/100) - Typical harvest arrival volumes."
        price_risk = "Medium"
    else:
        # Main season glut
        supply_adjustment = 0.90
        arrival_interpretation = f"Main Season Glut (Index: {avg_arr_idx}/100) - High open-field arrival depresses wholesale prices."
        price_risk = "High"

    # 5. Trend Velocity Momentum (Damped to avoid over-extrapolation)
    # A 20% 30-day rise carries +2.5% forward momentum into harvest projection
    trend_momentum = 1.0 + max(-0.15, min(0.20, (trend_30d_pct / 100.0) * 0.12))

    # 6. Ensemble Estimation (Section 10 Correct Logic)
    # Today's price modulated by seasonality, supply conditions, and trend momentum:
    projected_from_current = current_price * seasonal_multiplier * trend_momentum * supply_adjustment

    # Blend 45% projected-from-current with 55% historical seasonal harvest baseline
    # Anchoring to long-term seasonal distribution prevents short-term spikes from distorting future harvests
    estimated_mid = round((0.45 * projected_from_current) + (0.55 * hist_harvest_baseline), 1)

    # Volatility band (15% base interval coverage)
    volatility = 0.15
    if avg_arr_idx <= 45:
        volatility = 0.18 # Higher spread in volatile off-season windows

    est_min = max(15.0, round(estimated_mid * (1.0 - volatility), 0))
    est_max = round(estimated_mid * (1.0 + volatility), 0)

    # 7. Simple Historical Baseline for comparison (Section 16 requirement)
    baseline_min = round(hist_harvest_baseline * 0.88, 0)
    baseline_max = round(hist_harvest_baseline * 1.12, 0)

    # 8. Confidence Scoring
    # Freshness + horizon length + volatility
    days_to_harvest = (peak_harvest_date - planting_date).days
    if data_freshness_state == "LIVE" and days_to_harvest <= 90:
        confidence = "High"
    elif data_freshness_state in ["LIVE", "RECENT"] and days_to_harvest <= 140:
        confidence = "Medium"
    else:
        confidence = "Low"

    # Harvest Window String
    h_start_str = first_harvest_date.strftime("%b %d")
    h_end_str = end_harvest_date.strftime("%b %d, %Y")
    harvest_window_str = f"{h_start_str} – {h_end_str}"
    target_months_str = f"{MONTH_NAMES_EN[start_m]} / {MONTH_NAMES_EN[end_m]}"

    return {
        "crop_slug": crop_slug,
        "current_price": current_price,
        "current_price_date": current_price_date,
        "expected_harvest_period": harvest_window_str,
        "target_harvest_months": target_months_str,
        "days_to_first_harvest": (first_harvest_date - planting_date).days,
        "estimated_price_min": est_min,
        "estimated_price_max": est_max,
        "estimated_price_mid": estimated_mid,
        "estimated_price_range_str": f"NPR {int(est_min)}–{int(est_max)}/kg",
        "historical_harvest_baseline_avg": hist_harvest_baseline,
        "historical_baseline_range_str": f"NPR {int(baseline_min)}–{int(baseline_max)}/kg",
        "seasonal_multiplier": seasonal_multiplier,
        "seasonal_pattern_summary": (
            f"Historically {round((seasonal_multiplier - 1.0) * 100, 1):+}% shift from "
            f"{MONTH_NAMES_EN[curr_m]} to harvest period ({target_months_str})"
        ),
        "arrival_index": avg_arr_idx,
        "arrival_interpretation": arrival_interpretation,
        "price_trend_velocity": f"{trend_30d_pct:+.1f}% over 30d",
        "confidence": confidence,
        "price_risk": price_risk,
        "model_type": "Multi-Factor Econometric Ensemble (Online Mandi + Historical Seasonality + Arrival Telemetry)",
        "baseline_comparison": {
            "historical_baseline_mid": hist_harvest_baseline,
            "model_forecast_mid": estimated_mid,
            "variance_from_baseline_pct": round(((estimated_mid - hist_harvest_baseline) / hist_harvest_baseline) * 100, 1)
        },
        "disclaimer": "ESTIMATE ONLY. Agricultural wholesale prices are subject to weather extremes, border freight flows, and seasonal perishability.",
        "data_source": source_name,
        "data_freshness": data_freshness_state
    }
