"""
Health Report Schemas
Request and response models for health report generation
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class HealthReportRequest(BaseModel):
    """Request to generate health report"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    lifestyle_data_id: Optional[int] = Field(None, description="Reference to stored lifestyle data")
    
    # Or embed lifestyle data directly
    age_range: Optional[str] = None
    smoking_status: Optional[str] = None
    activity_level: Optional[str] = None
    work_environment: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 40.7128,
                "longitude": -74.0060,
                "lifestyle_data_id": 1
            }
        }


class ContributingFactor(BaseModel):
    """Individual contributing factor to health risk"""
    category: str = Field(..., description="environmental/lifestyle")
    factor: str
    impact: str = Field(..., description="positive/negative")
    severity: str = Field(..., description="low/medium/high")


class HealthRecommendation(BaseModel):
    """Personalized health recommendation"""
    category: str
    title: str
    description: str
    priority: str = Field(..., description="low/medium/high")


class NoiseData(BaseModel):
    level: float
    risk_score: float
    source: str
    details: Optional[str] = "Estimated based on location type"

class RadiationData(BaseModel):
    level: str
    risk_score: float
    source: str
    details: Optional[str] = "Background estimation"

class HealthReportResponse(BaseModel):
    """Complete health risk report"""
    report_id: int
    
    # Overall Risk Assessment
    risk_score: float = Field(..., description="Combined risk score 0-100")
    risk_level: str = Field(..., description="low/medium/high")
    
    # Component Scores
    environmental_risk: float
    lifestyle_risk: float
    vulnerability_multiplier: float = Field(1.0, description="Multiplier based on age/health")
    
    # Analysis
    report_summary: str
    contributing_factors: List[ContributingFactor]
    health_recommendations: List[HealthRecommendation]
    
    # New Data Fields
    noise_data: Optional[NoiseData] = None
    radiation_data: Optional[RadiationData] = None
    
    # Location Context
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    
    # Personal Details
    name: Optional[str] = None
    years_at_location: Optional[int] = None
    sleep_hours: Optional[str] = None
    stress_level: Optional[str] = None
    activity_level: Optional[str] = None
    age_range: Optional[str] = None
    
    # Metadata
    generated_at: str
    version: str = "1.0"
    is_paid: int = 0
    
    # ML Feature Vector (for future use)
    feature_vector: Optional[Dict[str, float]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "report_id": 1,
                "risk_score": 42.5,
                "risk_level": "medium",
                "environmental_risk": 55.0,
                "lifestyle_risk": 30.0,
                "report_summary": "Your health risk is moderate, primarily driven by environmental air quality. Your healthy lifestyle choices help mitigate some environmental risks.",
                "contributing_factors": [
                    {
                        "category": "environmental",
                        "factor": "Elevated PM2.5 levels",
                        "impact": "negative",
                        "severity": "medium"
                    },
                    {
                        "category": "lifestyle",
                        "factor": "Non-smoker",
                        "impact": "positive",
                        "severity": "high"
                    }
                ],
                "health_recommendations": [
                    {
                        "category": "environmental",
                        "title": "Monitor Air Quality",
                        "description": "Check daily AQI and limit outdoor activities on high pollution days",
                        "priority": "high"
                    },
                    {
                        "category": "lifestyle",
                        "title": "Maintain Activity Level",
                        "description": "Continue your moderate exercise routine, preferably indoors or in areas with better air quality",
                        "priority": "medium"
                    }
                ],
                "latitude": 40.7128,
                "longitude": -74.0060,
                "location_name": "New York, NY",
                "generated_at": "2026-01-25T10:30:00Z",
                "version": "1.0"
            }
        }
