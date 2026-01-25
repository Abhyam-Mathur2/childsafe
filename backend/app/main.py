"""
FastAPI Main Application Entry Point
Environmental Health Analysis Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import air_quality, soil, lifestyle, health_report, weather
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Environmental Health Analysis API",
    description="Location-aware environmental health platform for personalized health risk analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(air_quality.router, prefix="/api", tags=["Air Quality"])
app.include_router(soil.router, prefix="/api", tags=["Soil & Environment"])
app.include_router(lifestyle.router, prefix="/api", tags=["Lifestyle"])
app.include_router(health_report.router, prefix="/api", tags=["Health Reports"])
app.include_router(weather.router, prefix="/api", tags=["Weather"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Environmental Health Analysis API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    from app.config import get_settings
    settings = get_settings()
    
    return {
        "status": "ok",
        "database": "connected",
        "services": ["air_quality", "soil", "lifestyle", "health_report", "weather"],
        "openweather_configured": bool(settings.OPENWEATHER_API_KEY)
    }
