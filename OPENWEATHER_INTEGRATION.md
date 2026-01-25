# 🌤️ OpenWeather API Integration Guide

## Overview

The platform now integrates **real-time weather and air quality data** using the OpenWeather API.

## Features Integrated

### 1. Weather Data (NEW)
- **Endpoint**: `GET /api/weather?latitude={lat}&longitude={lon}`
- **Data Fetched**:
  - Current temperature (Celsius)
  - Feels like temperature
  - Humidity percentage
  - Atmospheric pressure
  - Wind speed and direction
  - Weather condition and description
  - Cloud coverage
  - Visibility

### 2. Air Quality Data (UPDATED)
- **Endpoint**: `GET /api/air-quality?latitude={lat}&longitude={lon}`
- **Now uses**: OpenWeather Air Pollution API
- **Data Fetched**:
  - AQI (converted from 1-5 scale to 0-500 EPA scale)
  - PM2.5, PM10 concentrations
  - CO, NO2, SO2, O3 levels
- **Health Risk Interpretation**:
  - AQI 1-2 (0-75) → **Low** risk
  - AQI 3 (76-150) → **Moderate** risk
  - AQI 4-5 (151-500) → **High** risk

## Setup Instructions

### 1. Configure API Key

The API key is already in your `.env.example` file:

```bash
OPENWEATHER_API_KEY=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
```

**Create/Update your `.env` file**:
```powershell
cd "d:\new project\backend"

# If .env doesn't exist, copy from example
if (!(Test-Path .env)) { Copy-Item .env.example .env }

# Or manually create .env and add:
# OPENWEATHER_API_KEY=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
```

### 2. Install Dependencies

```powershell
pip install httpx==0.26.0
```

Or reinstall all dependencies:
```powershell
pip install -r requirements.txt
```

### 3. Restart the Server

```powershell
uvicorn app.main:app --reload
```

## Testing the Integration

### Test Weather Endpoint
```powershell
# New York coordinates
curl "http://localhost:8000/api/weather?latitude=40.7128&longitude=-74.0060"
```

**Expected Response**:
```json
{
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
```

### Test Air Quality Endpoint
```powershell
# Los Angeles coordinates (typically higher pollution)
curl "http://localhost:8000/api/air-quality?latitude=34.0522&longitude=-118.2437"
```

**Expected Response**:
```json
{
  "latitude": 34.0522,
  "longitude": -118.2437,
  "location_name": "Los Angeles, CA",
  "data": {
    "aqi": 125,
    "pm25": 35.2,
    "pm10": 45.8,
    "co": 0.8,
    "no2": 42.5,
    "so2": 8.3,
    "o3": 65.0
  },
  "risk_level": "medium",
  "health_interpretation": "Moderate air quality. Acceptable for most people...",
  "primary_pollutant": "PM2.5",
  "data_source": "openweather"
}
```

### Check API Status
```powershell
curl http://localhost:8000/health
```

Should show:
```json
{
  "status": "ok",
  "database": "connected",
  "services": ["air_quality", "soil", "lifestyle", "health_report", "weather"],
  "openweather_configured": true
}
```

## How It Works

### Architecture Changes

```
Frontend → GET /api/weather
         ↓
    WeatherRouter → WeatherService
         ↓
    OpenWeather API (Current Weather)
         ↓
    Normalized JSON Response


Frontend → GET /api/air-quality
         ↓
    AirQualityRouter → AirQualityService
         ↓
    OpenWeather API (Air Pollution)
         ↓
    AQI Conversion + Health Risk Analysis
         ↓
    Database Storage + Response
```

### Fallback Behavior

**If API key is not configured or API call fails:**
- Air quality endpoint falls back to **mock data**
- Weather endpoint returns an error (requires API)

This ensures the platform continues working even if the API is temporarily unavailable.

## API Rate Limits

**OpenWeather Free Tier:**
- 1,000 calls per day
- 60 calls per minute

**Recommendations:**
- Implement caching for frequently requested locations
- Store recent data in database
- Add rate limiting middleware

## Code Structure

### New Files
```
backend/app/
├── services/
│   ├── weather_service.py      # NEW: Weather API integration
│   └── air_quality_service.py  # UPDATED: Real API + fallback
├── schemas/
│   └── weather.py              # NEW: Weather data models
└── routers/
    └── weather.py              # NEW: Weather endpoint
```

### Updated Files
- `main.py` - Added weather router
- `requirements.txt` - Added httpx
- `.env.example` - Added API key
- `air_quality_service.py` - Integrated OpenWeather Air Pollution API

## Frontend Integration (Optional)

To display weather data in your frontend, update `frontend/app.js`:

```javascript
// After fetching environmental data, also fetch weather
async function fetchWeatherData(latitude, longitude) {
    const response = await fetch(
        `${API_BASE_URL}/weather?latitude=${latitude}&longitude=${longitude}`
    );
    const weatherData = await response.json();
    
    // Display weather info
    document.getElementById('temperature').textContent = 
        `${weatherData.data.temperature}°C`;
    document.getElementById('weather-condition').textContent = 
        weatherData.data.weather_description;
}
```

## Health Context Integration

The weather and air quality data now work together for better health insights:

- **High Temperature + High Humidity + Poor Air Quality** → Increased health risk
- **Weather conditions** affect outdoor activity recommendations
- **Wind speed** impacts pollutant dispersion and exposure

## Troubleshooting

### "OpenWeather API key not configured"
- Verify `.env` file exists in `backend/` directory
- Check that `OPENWEATHER_API_KEY` is set correctly
- Restart the FastAPI server after updating `.env`

### "Failed to fetch weather data"
- Check internet connection
- Verify API key is valid
- Check OpenWeather API status: https://status.openweathermap.org/

### API returns 401 Unauthorized
- API key may be invalid or expired
- Check for typos in `.env` file

### Using Mock Data Instead of Real Data
- If you see `"data_source": "mock"` in air quality responses:
  - API key not configured, or
  - API request failed (check logs)

## API Documentation

- **OpenWeather Current Weather**: https://openweathermap.org/current
- **OpenWeather Air Pollution**: https://openweathermap.org/api/air-pollution

## Next Steps

1. **Add Caching**: Store recent API responses to reduce calls
2. **Batch Requests**: Combine weather + air quality in one call
3. **Historical Data**: Use OpenWeather's historical API for trends
4. **Forecasts**: Add 5-day forecast endpoint
5. **Alerts**: Implement weather/air quality alerts

---

**Real-time environmental data is now live!** 🌍🌤️

Your platform now provides actual current conditions for any location worldwide.
