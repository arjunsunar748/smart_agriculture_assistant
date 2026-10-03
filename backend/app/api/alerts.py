from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.schemas.offseason_schemas import OffseasonAlertsResponse, OffseasonAlertOut
from app.services.offseason.planner import offseason_planner

router = APIRouter(prefix="/alerts", tags=["System Alerts"])

@router.get("", response_model=OffseasonAlertsResponse)
async def list_alerts():
    """
    Get all real-time agricultural and market intelligence alerts.
    Categories:
    - Planting window opening
    - Historical market opportunity approaching
    - Price crash & volatility risk
    - Weather & frost risk
    - Disease risk (Late blight, Downy mildew)
    - Harvest approaching
    - Target market window approaching
    """
    try:
        return offseason_planner.get_offseason_alerts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

@router.get("/critical", response_model=List[OffseasonAlertOut])
async def list_critical_alerts():
    """Get only critical severity alerts requiring immediate farmer action."""
    res = offseason_planner.get_offseason_alerts()
    return [a for a in res.alerts if a.severity == "critical"]
