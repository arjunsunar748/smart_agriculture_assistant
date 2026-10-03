import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List, Dict, Any

def forecast_price_ml(history_points: List[Dict[str, Any]], days_ahead: int = 14) -> Dict[str, Any]:
    """
    Fits a linear regression model on historical price points
    and projects the expected price range with uncertainty bounds.
    """
    if len(history_points) < 5:
        # Default fallback if insufficient data
        last_price = history_points[-1]["avg_price"] if history_points else 80.0
        return {
            "forecast_avg": round(last_price, 1),
            "forecast_min": round(last_price * 0.90, 1),
            "forecast_max": round(last_price * 1.12, 1),
            "confidence": "Low",
            "model_type": "Moving Average Baseline",
            "disclaimer": "Agricultural prices are volatile; forecasts are estimates subject to weather, imports, and transport."
        }

    prices = np.array([p["avg_price"] for p in history_points])
    n = len(prices)
    X = np.arange(n).reshape(-1, 1)
    y = prices

    model = LinearRegression()
    model.fit(X, y)

    # Future point
    future_X = np.array([[n + days_ahead]])
    pred_val = float(model.predict(future_X)[0])

    # Residual standard deviation for uncertainty
    residuals = y - model.predict(X)
    residual_std = float(np.std(residuals)) if len(residuals) > 1 else 5.0
    r_squared = float(model.score(X, y))

    # Guard against negative prices
    pred_val = max(15.0, pred_val)
    uncertainty_margin = max(5.0, 1.645 * residual_std) # 90% confidence interval

    min_p = max(10.0, round(pred_val - uncertainty_margin, 1))
    max_p = round(pred_val + uncertainty_margin, 1)

    if r_squared > 0.60:
        conf = "High"
    elif r_squared > 0.30:
        conf = "Medium"
    else:
        conf = "Low"

    return {
        "forecast_avg": round(pred_val, 1),
        "forecast_min": min_p,
        "forecast_max": max_p,
        "confidence": conf,
        "model_type": "Scikit-Learn Linear Regression with Residual Uncertainty Bounds",
        "r_squared": round(r_squared, 3),
        "disclaimer": "Agricultural price predictions carry market uncertainty and should not be considered guaranteed."
    }
