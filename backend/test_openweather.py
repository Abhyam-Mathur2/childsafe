"""
Test OpenWeather API Integration
Run this script to verify the API is working correctly
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.weather_service import weather_service
from app.services.air_quality_service import air_quality_service


async def test_weather_api():
    """Test weather API integration"""
    print("🌤️  Testing Weather API...")
    print("-" * 50)
    
    # Test with New York coordinates
    lat, lon = 40.7128, -74.0060
    
    try:
        result = await weather_service.get_weather(lat, lon)
        print(f"✓ Weather API call successful!")
        print(f"  Location: {result['location_name']}")
        print(f"  Temperature: {result['temperature']}°C")
        print(f"  Feels like: {result['feels_like']}°C")
        print(f"  Humidity: {result['humidity']}%")
        print(f"  Wind: {result['wind_speed']} m/s")
        print(f"  Condition: {result['weather_description']}")
        print(f"  Data source: {result['data_source']}")
        return True
    except Exception as e:
        print(f"✗ Weather API failed: {e}")
        return False


async def test_air_quality_api():
    """Test air quality API integration"""
    print("\n🌫️  Testing Air Quality API...")
    print("-" * 50)
    
    # Test with Los Angeles coordinates
    lat, lon = 34.0522, -118.2437
    
    try:
        result = await air_quality_service.get_air_quality(lat, lon)
        print(f"✓ Air Quality API call successful!")
        print(f"  Location: {result.location_name}")
        print(f"  AQI: {result.data.aqi}")
        print(f"  PM2.5: {result.data.pm25} μg/m³")
        print(f"  PM10: {result.data.pm10} μg/m³")
        print(f"  Risk Level: {result.risk_level}")
        print(f"  Primary Pollutant: {result.primary_pollutant}")
        print(f"  Data source: {result.data_source}")
        
        if result.data_source == "mock":
            print("\n⚠️  Warning: Using mock data. Check if API key is configured.")
        
        return True
    except Exception as e:
        print(f"✗ Air Quality API failed: {e}")
        return False


async def main():
    """Run all tests"""
    print("=" * 50)
    print("OpenWeather API Integration Test")
    print("=" * 50)
    
    # Check if API key is configured
    from app.config import get_settings
    settings = get_settings()
    
    if not settings.OPENWEATHER_API_KEY:
        print("\n❌ ERROR: OPENWEATHER_API_KEY not configured!")
        print("Please set it in your .env file:")
        print("OPENWEATHER_API_KEY=your_api_key_here")
        return
    
    print(f"\n✓ API Key configured: {settings.OPENWEATHER_API_KEY[:20]}...")
    print()
    
    # Run tests
    weather_ok = await test_weather_api()
    air_quality_ok = await test_air_quality_api()
    
    # Summary
    print("\n" + "=" * 50)
    print("Test Summary:")
    print(f"  Weather API: {'✓ PASS' if weather_ok else '✗ FAIL'}")
    print(f"  Air Quality API: {'✓ PASS' if air_quality_ok else '✗ FAIL'}")
    print("=" * 50)
    
    if weather_ok and air_quality_ok:
        print("\n🎉 All tests passed! OpenWeather integration is working.")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")


if __name__ == "__main__":
    asyncio.run(main())
