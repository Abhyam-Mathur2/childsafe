"""
Water Quality Router
"""

from fastapi import APIRouter, HTTPException, Query
from app.services.water_service import water_service
from app.schemas.water import WaterDataResponse

router = APIRouter()

@router.get("/water-quality", response_model=WaterDataResponse)
async def get_water_quality(
    latitude: float,
    longitude: float,
    city: str = Query(None),
    state: str = Query(None),
    country: str = Query(None)
):
    """
    Get water quality analysis for a location
    """
    return await water_service.get_water_quality(latitude, longitude, city, state, country)
