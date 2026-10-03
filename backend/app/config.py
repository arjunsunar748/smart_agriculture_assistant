import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Agriculture Assistant"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smart-agri-nepal-secret-key-production-ready-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Defaults to SQLite for zero-config startup, compatible with PostgreSQL via env var
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smart_agri.db")
    
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    KALIMATI_API_URL: str = "https://kalimatimarket.gov.np/api/daily-prices"
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
