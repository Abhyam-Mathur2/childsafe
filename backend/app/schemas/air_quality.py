"""
Air Quality Schemas
Request and response models for air quality data
"""

from pydantic import BaseModel, Field
from typing import Optional


class AirQualityRequest(BaseModel):
    """Request for air quality data"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class AirQualityData(BaseModel):
    """Air quality measurements"""
    aqi: int = Field(..., description="Air Quality Index (0-500)")
    pm25: float = Field(..., description="PM2.5 concentration (μg/m³)")
    pm10: float = Field(..., description="PM10 concentration (μg/m³)")
    co: float = Field(..., description="CO concentration (ppm)")
    no2: float = Field(..., description="NO2 concentration (ppb)")
    so2: float = Field(..., description="SO2 concentration (ppb)")
    o3: float = Field(..., description="O3 concentration (ppb)")


class AirQualityResponse(BaseModel):
    """Complete air quality response"""
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    data: AirQualityData
    risk_level: str = Field(..., description="low/medium/high")
    health_interpretation: str
    primary_pollutant: str
    data_source: str = "mock"
    
    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 40.7128,
                "longitude": -74.0060,
                "location_name": "New York, NY",
                "data": {
                    "aqi": 85,
                    "pm25": 25.5,
                    "pm10": 45.0,
                    "co": 0.5,
                    "no2": 35.0,
                    "so2": 10.0,
                    "o3": 55.0
                },
                "risk_level": "medium",
                "health_interpretation": "Moderate air quality. Sensitive individuals should consider limiting outdoor activities.",
                "primary_pollutant": "PM2.5",
                "data_source": "mock"
            }
        }
