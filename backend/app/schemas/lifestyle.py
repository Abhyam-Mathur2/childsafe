"""
Lifestyle Schemas
Request and response models for lifestyle/quiz data
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from enum import Enum


class AgeRange(str, Enum):
    """Age range categories"""
    TEEN = "13-17"
    YOUNG_ADULT = "18-25"
    ADULT = "26-35"
    MIDDLE_AGE = "36-50"
    SENIOR = "51-65"
    ELDERLY = "65+"


class SmokingStatus(str, Enum):
    """Smoking status options"""
    NEVER = "never"
    FORMER = "former"
    CURRENT = "current"


class ActivityLevel(str, Enum):
    """Physical activity level"""
    SEDENTARY = "sedentary"
    MODERATE = "moderate"
    ACTIVE = "active"


class WorkEnvironment(str, Enum):
    """Work environment type"""
    INDOOR = "indoor"
    OUTDOOR = "outdoor"
    MIXED = "mixed"


class LifestyleInput(BaseModel):
    """Lifestyle data input from gamified quiz"""
    name: Optional[str] = Field(None, description="User name")
    years_at_location: Optional[int] = Field(None, description="Years lived at current location")
    age_range: AgeRange
    gender: Optional[str] = Field(None, description="male/female/other/prefer_not_to_say")
    smoking_status: SmokingStatus
    activity_level: ActivityLevel
    work_environment: WorkEnvironment
    
    # Optional additional factors
    diet_quality: Optional[str] = Field(None, description="poor/average/good")
    sleep_hours: Optional[str] = Field(None, description="<6/6-8/>8")
    stress_level: Optional[str] = Field(None, description="low/medium/high")

    # Comprehensive Questionnaire Fields
    medical_history: Optional[list[str]] = Field(None, description="List of pre-existing conditions")
    medications: Optional[list[Dict[str, Any]]] = Field(None, description="List of medications")
    family_history: Optional[list[str]] = Field(None, description="Family history of diseases")
    home_environment: Optional[Dict[str, Any]] = Field(None, description="Home details: floor, cooking, etc.")
    occupational_details: Optional[Dict[str, Any]] = Field(None, description="Detailed job info")

    # Store all quiz responses
    quiz_responses: Optional[Dict[str, Any]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "age_range": "26-35",
                "gender": "female",
                "smoking_status": "never",
                "activity_level": "moderate",
                "work_environment": "indoor",
                "diet_quality": "good",
                "sleep_hours": "6-8",
                "stress_level": "medium",
                "quiz_responses": {
                    "exercise_minutes_per_week": 180,
                    "vegetables_servings_per_day": 3
                }
            }
        }


class LifestyleResponse(BaseModel):
    """Response after storing lifestyle data"""
    id: int
    message: str
    lifestyle_risk_score: float = Field(..., description="Risk score 0-100")
    risk_factors: list[str]
    positive_factors: list[str]
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "message": "Lifestyle data saved successfully",
                "lifestyle_risk_score": 35.5,
                "risk_factors": ["Moderate stress level"],
                "positive_factors": [
                    "Non-smoker",
                    "Moderate activity level",
                    "Good diet quality"
                ]
            }
        }
