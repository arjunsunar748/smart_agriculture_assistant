import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api import api_router
from app.services.crops.service import crop_service

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered agriculture decision-support system without IoT dependency. Real-time online meteorological, market, and agronomic intelligence.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.services.market.market_service import market_data_service
import asyncio

@app.on_event("startup")
async def on_startup():
    db = SessionLocal()
    try:
        crop_service.seed_initial_crops(db)
        market_data_service.seed_historical_market_data(db)
    finally:
        db.close()
    
    # Non-blocking background sync of live official market prices and arrivals
    asyncio.create_task(market_data_service.sync_latest_market_data())

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
