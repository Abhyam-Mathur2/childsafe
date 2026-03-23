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
        Get current weather data from OpenWeather API or Fallback
        """
        if not self.api_key:
            print("OpenWeather API key not configured. Using mock data.")
            return self._generate_mock_weather(latitude, longitude)
        
        url = f"{self.BASE_URL}/weather"
        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": self.api_key,
            "units": "metric"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                
                if response.status_code == 401:
                    print("Invalid OpenWeather API key. Falling back to mock data.")
                    return self._generate_mock_weather(latitude, longitude)
                
                response.raise_for_status()
                data = response.json()
            
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
            
        except Exception as e:
            print(f"Weather API failed ({e}). Falling back to mock data.")
            return self._generate_mock_weather(latitude, longitude)

    def _generate_mock_weather(self, lat: float, lon: float) -> dict:
        """Generate realistic mock weather data"""
        import random
        import time
        
        # Deterministic based on location
        random.seed(int((abs(lat) + abs(lon)) * 100))
        
        temp = round(random.uniform(10, 30), 1)
        conditions = ["Clear", "Clouds", "Rain", "Mist"]
        condition = random.choice(conditions)
        
        return {
            "latitude": lat,
            "longitude": lon,
            "location_name": f"Location ({lat:.2f}, {lon:.2f})",
            "temperature": temp,
            "feels_like": round(temp + random.uniform(-2, 2), 1),
            "humidity": random.randint(30, 90),
            "pressure": 1013,
            "wind_speed": round(random.uniform(0, 15), 1),
            "wind_direction": random.randint(0, 360),
            "weather_condition": condition,
            "weather_description": f"{condition.lower()} and breezy",
            "clouds": random.randint(0, 100),
            "visibility": 10000,
            "timestamp": int(time.time()),
            "data_source": "mock"
        }


# Singleton instance
weather_service = WeatherService()
