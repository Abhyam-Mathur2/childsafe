# 🚀 Quick Start - OpenWeather Integration

## 1️⃣ Install Dependency
```powershell
cd "d:\new project\backend"
pip install httpx==0.26.0
```

## 2️⃣ Configure API Key
Your API key is already in `.env.example`:
```
OPENWEATHER_API_KEY=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
```

**Create `.env` file:**
```powershell
Copy-Item .env.example .env
```

## 3️⃣ Test Integration
```powershell
python test_openweather.py
```

## 4️⃣ Start Server
```powershell
uvicorn app.main:app --reload
```

## 5️⃣ Test Endpoints

### Weather
```powershell
curl "http://localhost:8000/api/weather?latitude=40.7128&longitude=-74.0060"
```

### Air Quality
```powershell
curl "http://localhost:8000/api/air-quality?latitude=40.7128&longitude=-74.0060"
```

## 6️⃣ View API Docs
Open: http://localhost:8000/docs

---

## ✅ What You Get

✨ **Real-time weather data** (temperature, humidity, wind, conditions)  
✨ **Live air quality data** (AQI, PM2.5, PM10, CO, NO2, SO2, O3)  
✨ **Health risk interpretation** (Low/Moderate/High)  
✨ **Automatic fallback** to mock data if API fails  
✨ **Production-ready** error handling  

---

## 🆘 Troubleshooting

**API key not configured?**
```powershell
# Check .env file exists
Test-Path .env

# Verify it contains OPENWEATHER_API_KEY
Get-Content .env | Select-String "OPENWEATHER"
```

**httpx not installed?**
```powershell
pip install httpx==0.26.0
```

**Server not starting?**
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Use different port
uvicorn app.main:app --reload --port 8001
```

---

## 📖 Full Documentation
See [OPENWEATHER_INTEGRATION.md](OPENWEATHER_INTEGRATION.md) for complete details.

**You're ready to go! 🎉**
