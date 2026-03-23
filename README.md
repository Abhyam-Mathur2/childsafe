# ChildSafeEnviro

A location-aware web platform that analyzes environmental health risks by combining real-time air quality data, soil conditions, and lifestyle factors to generate personalized health reports.

## 🌟 Features

- **📍 Location-Based Analysis**: Automatically captures user location to fetch relevant environmental data
- **�️ Real-Time Weather**: Current temperature, humidity, wind, and conditions via OpenWeather API
- **🌫️ Live Air Quality Monitoring**: Real-time AQI and detailed pollutant levels (PM2.5, PM10, CO, NO2, SO2, O3) from OpenWeather
- **🌱 Soil Health Assessment**: Analyzes soil type, pH, and contamination risks
- **🎮 Gamified Lifestyle Quiz**: Collects user health behaviors through an interactive questionnaire
- **📊 Personalized Health Reports**: Generates comprehensive risk assessments with actionable recommendations
- **💾 Data Storage**: All data stored for future ML-based health predictions
- **🔮 ML-Ready**: Feature vectors prepared for machine learning model integration

## 🏗️ Architecture

```
environmental-health-platform/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── routers/        # API endpoint definitions
│   │   ├── services/       # Business logic layer
│   │   ├── config.py       # Configuration management
│   │   ├── database.py     # Database setup
│   │   └── main.py         # FastAPI application
│   ├── ml/                 # Machine learning placeholder
│   ├── requirements.txt
│   └── .env.example
└── frontend/               # React + Vite frontend
  ├── index.html
  ├── src/
  └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Modern web browser with geolocation support

### Backend Setup

1. **Clone and navigate to project**
   ```powershell
   cd "d:\new project"
   ```

2. **Create virtual environment**
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```powershell
   cp .env.example .env
   # Edit .env with your database credentials and OpenWeather API key
   # OPENWEATHER_API_KEY is already set in .env.example
   ```

5. **Set up PostgreSQL database**
   ```sql
  CREATE DATABASE childsafeenviro;
   ```

6. **Update DATABASE_URL in .env**
   ```
  DATABASE_URL=postgresql://username:password@localhost:5432/childsafeenviro
   ```

7. **Run the application**
   ```powershell
   uvicorn app.main:app --reload
   ```

   Backend will be available at: `http://localhost:8000`
   API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies and start Vite**
  ```powershell
  cd frontend
  npm install
  npm run dev
  ```
  Then navigate to `http://localhost:5173`

## 📡 API Endpoints

### Weather (NEW)
- `GET /api/weather?latitude={lat}&longitude={lon}`
  - Returns real-time temperature, humidity, wind, conditions

### Air Quality
- `GET /api/air-quality?latitude={lat}&longitude={lon}`
  - Returns AQI, pollutant levels, risk assessment
  - **Now uses OpenWeather API for real-time data**

### Soil Data
- `GET /api/soil-data?latitude={lat}&longitude={lon}`
  - Returns soil type, pH, contamination risk

### Lifestyle Data
- `POST /api/lifestyle`
  - Accepts lifestyle quiz responses
  - Returns lifestyle risk score

### Health Report
- `POST /api/health-report`
  - Generates comprehensive health analysis
  - Combines environmental + lifestyle data

## 🗄️ Database Schema

### Tables

**users**
- User authentication and profile data

**environmental_data**
- Air quality metrics (AQI, PM2.5, PM10, CO, NO2, SO2, O3)
- Soil properties (type, pH, contamination)
- Location coordinates

**lifestyle_data**
- Age, gender, smoking status
- Activity level, work environment
- Diet, sleep, stress levels

**health_reports**
- Risk scores and levels
- Contributing factors
- Health recommendations
- Feature vectors for ML

## 🎯 User Flow

1. **Location Capture**: User grants location permission
2. **Environmental Analysis**: System fetches air quality and soil data
3. **Lifestyle Quiz**: User completes gamified health questionnaire
4. **Report Generation**: AI combines all data to create personalized report
5. **Recommendations**: User receives actionable health guidance

## 🔮 Future ML Integration

The platform is designed to evolve from rule-based scoring to ML-based predictions:

### Current (Rule-Based)
- Hard-coded risk thresholds
- Linear scoring algorithms
- Expert-defined recommendations

### Future (ML-Based)
- Train models on collected data
- Predict long-term health outcomes
- Identify non-obvious risk patterns
- Personalized intervention timing

### Prepared Features
- Environmental exposure metrics
- Lifestyle behavior patterns
- Geographic clustering
- Temporal trends

## 🔒 Security Considerations

- **Location Privacy**: Location data stored only for analysis
- **Data Encryption**: Use HTTPS in production
- **Database Security**: Implement proper PostgreSQL authentication
- **API Rate Limiting**: Add rate limiting for production
- **Input Validation**: All inputs validated via Pydantic

## 🛠️ Technology Stack

**Backend**
- FastAPI (Python web framework)
- PostgreSQL (Database)
- SQLAlchemy (ORM)
- Pydantic (Validation)

**Frontend**
- React + Vite
- React Router
- Tailwind CSS + Framer Motion

**Future ML**
- scikit-learn
- NumPy/Pandas
- SHAP/LIME for explainability

## 📊 Sample API Response

```json
{
  "report_id": 1,
  "risk_score": 42.5,
  "risk_level": "medium",
  "environmental_risk": 55.0,
  "lifestyle_risk": 30.0,
  "report_summary": "Your health risk is moderate, primarily driven by environmental air quality...",
  "contributing_factors": [
    {
      "category": "environmental",
      "factor": "Elevated PM2.5 levels (25.5 μg/m³)",
      "impact": "negative",
      "severity": "medium"
    }
  ],
  "health_recommendations": [
    {
      "category": "environmental",
      "title": "Monitor Air Quality Daily",
      "description": "Check AQI before outdoor activities...",
      "priority": "high"
    }
  ]
}
```

## 🧪 Testing

```powershell
# Test API health
curl http://localhost:8000/health

# Test weather endpoint (NEW)
curl "http://localhost:8000/api/weather?latitude=40.7128&longitude=-74.0060"

# Test air quality endpoint (now with real data)
curl "http://localhost:8000/api/air-quality?latitude=40.7128&longitude=-74.0060"

# Run OpenWeather integration test
cd backend
python test_openweather.py

# View interactive API docs
# Open http://localhost:8000/docs
```

## 🤝 Contributing

This is a production-ready MVP designed for:
- Environmental health researchers
- Public health organizations
- Smart city initiatives
- Health-conscious individuals

## 📝 License

MIT License - Open for academic and commercial use

## 👥 Authors

Built as a comprehensive ChildSafeEnviro platform combining location intelligence, environmental science, and personalized health analytics.

## 🔗 Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- PostgreSQL: https://www.postgresql.org/
- **OpenWeather API**: https://openweathermap.org/api
- Air Quality Standards: https://www.epa.gov/
- Soil Health: https://www.nrcs.usda.gov/

**📖 Additional Documentation**:
- [OpenWeather Integration Guide](OPENWEATHER_INTEGRATION.md) - Setup and testing
- [Architecture Documentation](ARCHITECTURE.md) - System design details
- [Quick Start Guide](QUICKSTART.md) - Get running in 5 minutes

---

**Ready to analyze environmental health impacts?**  
Start the backend, open the frontend, and discover your personalized health insights! 🌍💚
