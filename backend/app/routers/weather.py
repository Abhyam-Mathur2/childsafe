"""
Weather Router
API endpoints for weather data
"""

from fastapi import APIRouter, HTTPException
from app.schemas.weather import WeatherResponse
from app.services.weather_service import weather_service

router = APIRouter()


@router.get("/weather", response_model=WeatherResponse)
async def get_weather(
    latitude: float,
    longitude: float
):
    """
    Get current weather data for a location
    
    Parameters:
    - latitude: Latitude coordinate (-90 to 90)
    - longitude: Longitude coordinate (-180 to 180)
    
    Returns current weather conditions including temperature, humidity,
    wind speed, and weather description from OpenWeather API.
    """
    # Validate coordinates
    if not -90 <= latitude <= 90:
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
    if not -180 <= longitude <= 180:
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
    
    try:
        # Get weather data from service
        weather_data = await weather_service.get_weather(latitude, longitude)
        
        # Build response
        from app.schemas.weather import WeatherData
        return WeatherResponse(
            latitude=latitude,
            longitude=longitude,
            location_name=weather_data["location_name"],
            data=WeatherData(
                temperature=weather_data["temperature"],
                feels_like=weather_data["feels_like"],
                humidity=weather_data["humidity"],
                pressure=weather_data["pressure"],
                wind_speed=weather_data["wind_speed"],
                wind_direction=weather_data["wind_direction"],
                weather_condition=weather_data["weather_condition"],
                weather_description=weather_data["weather_description"],
                clouds=weather_data["clouds"],
                visibility=weather_data["visibility"]
            ),
            timestamp=weather_data["timestamp"],
            data_source=weather_data["data_source"]
        )
    except ValueError as e:
        print(f"ValueError in weather router: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Exception in weather router: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=502, detail=f"Weather API error: {str(e)}")
