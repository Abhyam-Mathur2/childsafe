"""
FastAPI Main Application Entry Point
Childsafeenvirons
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import air_quality, soil, lifestyle, health_report, weather, water, payments
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Childsafeenvirons API",
    description="Location-aware environmental health platform for personalized health risk analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(air_quality.router, prefix="/api", tags=["Air Quality"])
app.include_router(soil.router, prefix="/api", tags=["Soil & Environment"])
app.include_router(lifestyle.router, prefix="/api", tags=["Lifestyle"])
app.include_router(health_report.router, prefix="/api", tags=["Health Reports"])
app.include_router(payments.router, prefix="/api", tags=["Payments"])
app.include_router(weather.router, prefix="/api", tags=["Weather"])
app.include_router(water.router, prefix="/api", tags=["Water Quality"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Childsafeenvirons API",
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
