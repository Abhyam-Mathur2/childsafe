"""
Configuration Management
Loads environment variables and provides app configuration
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./envhealth.db"
    
    # API Keys (for future real API integrations)
    AIR_QUALITY_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""
    PERPLEXITY_API_KEY: str = ""
    AIRPAY_MERCHANT_ID: str = ""
    AIRPAY_USERNAME: str = ""
    AIRPAY_PASSWORD: str = ""
    AIRPAY_API_KEY: str = ""
    AIRPAY_CLIENT_ID: str = ""
    AIRPAY_SECRET_KEY: str = ""
    AIRPAY_IS_TEST: bool = True
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    DEBUG: bool = True
    APP_NAME: str = "Environmental Health Analysis Platform"
    FRONTEND_URL: str = "http://localhost:5173"  # Frontend URL for callbacks
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
