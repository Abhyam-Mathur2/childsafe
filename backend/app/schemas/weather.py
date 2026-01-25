"""
Weather Schemas
Request and response models for weather data
"""

from pydantic import BaseModel, Field
from typing import Optional


class WeatherRequest(BaseModel):
    """Request for weather data"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class WeatherData(BaseModel):
    """Weather measurements"""
    temperature: float = Field(..., description="Temperature in Celsius")
    feels_like: float = Field(..., description="Feels like temperature in Celsius")
    humidity: int = Field(..., description="Humidity percentage")
    pressure: int = Field(..., description="Atmospheric pressure in hPa")
    wind_speed: float = Field(..., description="Wind speed in m/s")
    wind_direction: int = Field(..., description="Wind direction in degrees")
    weather_condition: str = Field(..., description="Main weather condition")
    weather_description: str = Field(..., description="Detailed weather description")
    clouds: int = Field(..., description="Cloudiness percentage")
    visibility: int = Field(..., description="Visibility in meters")


class WeatherResponse(BaseModel):
    """Complete weather response"""
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    data: WeatherData
    timestamp: int = Field(..., description="Unix timestamp")
    data_source: str = "openweather"
    
    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 40.7128,
                "longitude": -74.0060,
                "location_name": "New York",
                "data": {
                    "temperature": 15.5,
                    "feels_like": 13.2,
                    "humidity": 65,
                    "pressure": 1013,
                    "wind_speed": 4.5,
                    "wind_direction": 180,
                    "weather_condition": "Clouds",
                    "weather_description": "scattered clouds",
                    "clouds": 40,
                    "visibility": 10000
                },
                "timestamp": 1706198400,
                "data_source": "openweather"
            }
        }
