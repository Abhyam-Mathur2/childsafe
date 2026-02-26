# 🚀 Quick Start Guide

## Get Running in 5 Minutes

### Step 1: Install PostgreSQL (if not installed)
Download from: https://www.postgresql.org/download/windows/

Create database:
```sql
CREATE DATABASE childsaveenviro;
```

### Step 2: Set Up Backend
```powershell
# Navigate to backend
cd "d:\new project\backend"

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
Copy-Item .env.example .env
# Edit .env and update DATABASE_URL with your PostgreSQL credentials

# Create database tables
python create_tables.py

# Start the server
uvicorn app.main:app --reload
```

Backend running at: http://localhost:8000
API Docs at: http://localhost:8000/docs

### Step 3: Open Frontend
```powershell
# In new terminal
cd "d:\new project\frontend"
npm install
npm run dev
```

Open browser: http://localhost:5173

### Step 4: Test the Flow
1. Click "Get My Location" (allow location access)
2. View environmental analysis
3. Complete lifestyle quiz
4. See your personalized health report!

## 🧪 Quick API Test
```powershell
# Test health endpoint
curl http://localhost:8000/health

# Test air quality (New York coordinates)
curl "http://localhost:8000/api/air-quality?latitude=40.7128&longitude=-74.0060"
```

## 📊 View API Documentation
Open http://localhost:8000/docs for interactive Swagger UI

## ⚡ Troubleshooting

**Database connection error?**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database 'childsaveenviro' exists

**Frontend can't connect to API?**
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify `VITE_API_BASE_URL` in `.env` (if configured)

**Location not working?**
- Use HTTPS or localhost (required for geolocation)
- Check browser location permissions
- Try a different browser

## 🎯 Next Steps

1. **Customize Mock Data**: Edit service files to change environmental values
2. **Connect Real APIs**: Add API keys in .env for real air quality data
3. **Add Authentication**: Uncomment user authentication in routers
4. **Deploy to Cloud**: Use services like Heroku, AWS, or DigitalOcean
5. **Train ML Models**: Collect data and implement ml/__init__.py models

## 📚 Key Files

- `backend/app/main.py` - Main FastAPI application
- `backend/app/routers/` - API endpoints
- `backend/app/services/` - Business logic
- `frontend/src/` - Frontend logic
- `.env` - Configuration (create from .env.example)

Happy coding! 🌍💚
