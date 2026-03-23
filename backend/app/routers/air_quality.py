"""
Air Quality Router
API endpoints for air quality data
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.air_quality import AirQualityRequest, AirQualityResponse
from app.services.air_quality_service import air_quality_service
from app.database import get_db
from app.models.environmental_data import EnvironmentalData

router = APIRouter()


@router.get("/air-quality", response_model=AirQualityResponse)
async def get_air_quality(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db)
):
    """
    Get air quality data for a location
    
    Parameters:
    - latitude: Latitude coordinate (-90 to 90)
    - longitude: Longitude coordinate (-180 to 180)
    
    Returns comprehensive air quality metrics including AQI, pollutant levels,
    risk assessment, and health recommendations.
    Uses OpenWeather Air Pollution API for real-time data.
    """
    # Validate coordinates
    if not -90 <= latitude <= 90:
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
    if not -180 <= longitude <= 180:
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
    
    # Get air quality data from service
    try:
        result = await air_quality_service.get_air_quality(latitude, longitude)
    except ValueError as e:
        # Surface upstream API/config errors to caller
        raise HTTPException(status_code=502, detail=str(e))
    
    # Store in database for future ML
    env_data = EnvironmentalData(
        latitude=latitude,
        longitude=longitude,
        location_name=result.location_name,
        aqi=result.data.aqi,
        pm25=result.data.pm25,
        pm10=result.data.pm10,
        co=result.data.co,
        no2=result.data.no2,
        so2=result.data.so2,
        o3=result.data.o3,
        data_source=result.data_source
    )
    db.add(env_data)
    db.commit()
    
    return result
