from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.recommendation.engine import recommendation_engine
from app.schemas.schemas import RecommendationRequest, RecommendationResponse

router = APIRouter(prefix="/recommendation", tags=["Recommendation"])

@router.post("/evaluate", response_model=RecommendationResponse)
async def evaluate_crops(req: RecommendationRequest, db: Session = Depends(get_db)):
    result = await recommendation_engine.evaluate_recommendations(db, req)
    return result
