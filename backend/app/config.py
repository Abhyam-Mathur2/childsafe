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
    OPENAI_API_KEY: str = ""
    AIRPAY_MERCHANT_ID: str = ""
    AIRPAY_USERNAME: str = ""
    AIRPAY_PASSWORD: str = ""
    AIRPAY_API_KEY: str = ""
    AIRPAY_CLIENT_ID: str = ""
    AIRPAY_SECRET_KEY: str = ""
    AIRPAY_IS_TEST: bool = True
    # Optional override for Airpay payment endpoint (useful for sandbox vs live)
    AIRPAY_BASE_URL: str = ""
    # Domain to send as 'Referer' to Airpay (must match your registered domain)
    AIRPAY_REFERER_DOMAIN: str = "childsafeenvirons.com"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google OAuth / JWT sessions
    GOOGLE_CLIENT_ID: str = ""
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_EXPIRE_DAYS: int = 30

    # Only this email may access the admin CMS
    ADMIN_EMAIL: str = "dakshsingh791@gmail.com"

    # Email (Brevo) - for emailing generated health reports to users
    BREVO_API_KEY: str = ""
    EMAIL_FROM: str = "ChildSafeEnviro <noreply@childsafeenvirons.com>"

    # Google Earth Engine (real water data: JRC Global Surface Water + WRI Aqueduct)
    # Prefer GEE_SERVICE_ACCOUNT_KEY_JSON (full key JSON as one env var - portable to
    # any host); GEE_SERVICE_ACCOUNT_KEY_FILE (path to the downloaded key file) is a
    # local-dev convenience fallback. Leave both empty to disable and use the
    # deterministic mock fallback instead.
    GEE_SERVICE_ACCOUNT_EMAIL: str = ""
    GEE_SERVICE_ACCOUNT_KEY_JSON: str = ""
    GEE_SERVICE_ACCOUNT_KEY_FILE: str = ""
    GEE_PROJECT_ID: str = ""
    
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
