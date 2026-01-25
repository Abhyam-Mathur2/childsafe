"""
Air Quality Service
Business logic for air quality data retrieval and analysis
Uses OpenWeather Air Pollution API for real-time data
"""

import httpx
import random
from typing import Dict, Tuple
from app.schemas.air_quality import AirQualityData, AirQualityResponse
from app.config import get_settings

settings = get_settings()


class AirQualityService:
    """Service for fetching and analyzing air quality data from OpenWeather API"""
    
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    def __init__(self):
        """Initialize service with OpenWeather API key"""
        self.api_key = settings.OPENWEATHER_API_KEY
    
    async def get_air_quality(self, latitude: float, longitude: float) -> AirQualityResponse:
        """
        Get air quality data for location
        Uses OpenWeather API. Mock data is no longer used for AQI.
        """
        if not self.api_key:
            raise ValueError("OPENWEATHER_API_KEY is required for air quality service")

        air_data = await self._fetch_real_air_quality(latitude, longitude)
        data_source = "openweather"
        
        # Analyze risk level
        risk_level = self._calculate_air_risk_level(air_data)
        
        # Determine primary pollutant
        primary_pollutant = self._get_primary_pollutant(air_data)
        
        # Generate health interpretation
        health_interpretation = self._generate_health_interpretation(air_data.aqi, risk_level)
        
        # Get location name (would need geocoding API for real implementation)
        location_name = self._get_location_name(latitude, longitude)
        
        return AirQualityResponse(
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
            data=air_data,
            risk_level=risk_level,
            health_interpretation=health_interpretation,
            primary_pollutant=primary_pollutant,
            data_source=data_source
        )
    
    async def _fetch_real_air_quality(self, lat: float, lon: float) -> AirQualityData:
        """Fetch real air quality data from OpenWeather API"""
        url = f"{self.BASE_URL}/air_pollution"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
            
            # OpenWeather Air Pollution API response structure
            components = data["list"][0]["components"]
            aqi_openweather = data["list"][0]["main"]["aqi"]  # 1-5 scale
            
            # Convert OpenWeather AQI (1-5) to US EPA scale (0-500)
            # This is an approximation for consistency
            aqi_mapping = {1: 25, 2: 75, 3: 125, 4: 200, 5: 350}
            aqi = aqi_mapping.get(aqi_openweather, 100)
            
            return AirQualityData(
                aqi=aqi,
                pm25=round(components.get("pm2_5", 0), 1),
                pm10=round(components.get("pm10", 0), 1),
                co=round(components.get("co", 0) / 1000, 2),  # Convert μg/m³ to mg/m³
                no2=round(components.get("no2", 0), 1),
                so2=round(components.get("so2", 0), 1),
                o3=round(components.get("o3", 0), 1)
            )
            
        except httpx.HTTPError as e:
            raise ValueError(f"OpenWeather API error: {e}")
        except (KeyError, IndexError) as e:
            raise ValueError(f"Unexpected OpenWeather API response format: {e}")
    
    def _generate_mock_air_quality(self, lat: float, lon: float) -> AirQualityData:
        """Generate realistic mock air quality data"""
        # Use location to seed variation
        seed = int((abs(lat) + abs(lon)) * 100)
        random.seed(seed)
        
        # Generate correlated pollutant levels
        base_pollution = random.uniform(20, 120)
        
        return AirQualityData(
            aqi=int(base_pollution + random.uniform(-10, 30)),
            pm25=round(base_pollution * 0.3 + random.uniform(-5, 10), 1),
            pm10=round(base_pollution * 0.5 + random.uniform(-5, 15), 1),
            co=round(random.uniform(0.2, 1.5), 2),
            no2=round(base_pollution * 0.4 + random.uniform(-10, 15), 1),
            so2=round(random.uniform(5, 30), 1),
            o3=round(random.uniform(30, 80), 1)
        )
    
    def _calculate_air_risk_level(self, data: AirQualityData) -> str:
        """Calculate risk level based on AQI"""
        if data.aqi <= 50:
            return "low"
        elif data.aqi <= 100:
            return "medium"
        else:
            return "high"
    
    def _get_primary_pollutant(self, data: AirQualityData) -> str:
        """Identify primary pollutant"""
        pollutants = {
            "PM2.5": data.pm25 / 35.4,  # Normalize to AQI breakpoint
            "PM10": data.pm10 / 154,
            "CO": data.co / 9.4,
            "NO2": data.no2 / 100,
            "SO2": data.so2 / 75,
            "O3": data.o3 / 70
        }
        return max(pollutants, key=pollutants.get)
    
    def _generate_health_interpretation(self, aqi: int, risk_level: str) -> str:
        """Generate human-readable health interpretation"""
        interpretations = {
            "low": "Good air quality. Air pollution poses little or no risk. Ideal for outdoor activities.",
            "medium": "Moderate air quality. Acceptable for most people, but sensitive individuals should consider limiting prolonged outdoor exertion.",
            "high": "Unhealthy air quality. Everyone may begin to experience health effects. Sensitive groups should avoid outdoor activities."
        }
        return interpretations.get(risk_level, "Unknown air quality")
    
    def _get_location_name(self, lat: float, lon: float) -> str:
        """
        Get location name from coordinates
        Mock implementation - use geocoding API in production
        """
        # Simple mock based on major cities
        if 40 <= lat <= 41 and -75 <= lon <= -73:
            return "New York, NY"
        elif 34 <= lat <= 35 and -119 <= lon <= -117:
            return "Los Angeles, CA"
        elif 37 <= lat <= 38 and -123 <= lon <= -122:
            return "San Francisco, CA"
        else:
            return f"Location ({lat:.2f}, {lon:.2f})"


# Singleton instance
air_quality_service = AirQualityService()
