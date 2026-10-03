from fastapi import APIRouter
from app.api.weather import router as weather_router
from app.api.crops import router as crops_router
from app.api.market import router as market_router
from app.api.recommendation import router as recommendation_router
from app.api.decision import router as decision_router
from app.api.compare import router as compare_router
from app.api.profit import router as profit_router
from app.api.disease import router as disease_router
from app.api.calendar import router as calendar_router
from app.api.geo import router as geo_router
from app.api.ai_chat import router as ai_chat_router
from app.api.farms import router as farms_router
from app.api.offseason import router as offseason_router
from app.api.future_iot import router as future_iot_router
from app.api.alerts import router as alerts_router

api_router = APIRouter()
api_router.include_router(weather_router)
api_router.include_router(crops_router)
api_router.include_router(market_router)
api_router.include_router(recommendation_router)
api_router.include_router(decision_router)
api_router.include_router(compare_router)
api_router.include_router(profit_router)
api_router.include_router(disease_router)
api_router.include_router(calendar_router)
api_router.include_router(geo_router)
api_router.include_router(ai_chat_router)
api_router.include_router(farms_router)
api_router.include_router(offseason_router)
api_router.include_router(future_iot_router)
api_router.include_router(alerts_router)

