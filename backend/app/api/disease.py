from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.disease.risk_engine import disease_risk_engine
from app.schemas.schemas import DiseaseRiskResponse

router = APIRouter(prefix="/disease", tags=["Disease & Pest Risk"])

@router.get("/risk/{crop_slug}", response_model=DiseaseRiskResponse)
async def get_disease_risk(
    crop_slug: str,
    district: str = Query("Kathmandu", description="Nepal district name"),
    db: Session = Depends(get_db)
):
    result = await disease_risk_engine.evaluate_risk(db, crop_slug, district)
    return result
