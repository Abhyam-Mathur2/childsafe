"""
Soil and Environment Schemas
Request and response models for soil data
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class SoilDataRequest(BaseModel):
    """Request for soil data"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class SoilProperties(BaseModel):
    """Soil property measurements"""
    soil_type: str = Field(..., description="Type of soil (clay/sandy/loam/silt)")
    ph: float = Field(..., description="Soil pH level (0-14)")
    organic_matter: float = Field(..., description="Organic matter percentage")
    contamination_risk: str = Field(..., description="low/medium/high")


class SoilDataResponse(BaseModel):
    """Complete soil data response"""
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    properties: SoilProperties
    health_impacts: List[str]
    risk_level: str = Field(..., description="low/medium/high")
    recommendations: List[str]
    data_source: str = "mock"
    
    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 40.7128,
                "longitude": -74.0060,
                "location_name": "New York, NY",
                "properties": {
                    "soil_type": "loam",
                    "ph": 6.5,
                    "organic_matter": 3.5,
                    "contamination_risk": "low"
                },
                "health_impacts": [
                    "Good drainage reduces mosquito breeding",
                    "Balanced pH supports healthy vegetation"
                ],
                "risk_level": "low",
                "recommendations": [
                    "Safe for gardening with standard precautions",
                    "Regular soil testing recommended for urban gardens"
                ],
                "data_source": "mock"
            }
        }
