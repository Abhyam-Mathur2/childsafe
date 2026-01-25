"""
Weather Service
Fetches real-time weather data from OpenWeather API
"""

import httpx
from typing import Optional
from app.config import get_settings

settings = get_settings()


class WeatherService:
    """Service for fetching weather data from OpenWeather API"""
    
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
    
    async def get_weather(self, latitude: float, longitude: float) -> dict:
        """
        Get current weather data from OpenWeather API
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            dict: Normalized weather data
        """
        if not self.api_key:
            raise ValueError("OpenWeather API key not configured")
        
        url = f"{self.BASE_URL}/weather"
        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": self.api_key,
            "units": "metric"  # Use Celsius
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
            
            print(f"OpenWeather API response: {data}")
            
            # Normalize response for frontend
            return {
                "latitude": latitude,
                "longitude": longitude,
                "location_name": data.get("name", "Unknown"),
                "temperature": data["main"]["temp"],
                "feels_like": data["main"]["feels_like"],
                "humidity": data["main"]["humidity"],
                "pressure": data["main"]["pressure"],
                "wind_speed": data["wind"]["speed"],
                "wind_direction": data["wind"].get("deg", 0),
                "weather_condition": data["weather"][0]["main"],
                "weather_description": data["weather"][0]["description"],
                "clouds": data["clouds"]["all"],
                "visibility": data.get("visibility", 10000),
                "timestamp": data["dt"],
                "data_source": "openweather"
            }
            
        except httpx.HTTPError as e:
            print(f"HTTP Error: {e}")
            raise Exception(f"Failed to fetch weather data: {str(e)}")
        except KeyError as e:
            print(f"KeyError parsing response: {e}")
            raise Exception(f"Unexpected API response format: {str(e)}")


# Singleton instance
weather_service = WeatherService()
