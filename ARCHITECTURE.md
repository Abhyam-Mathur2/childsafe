# 🏛️ System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  HTML/CSS/JavaScript                                  │   │
│  │  - Location Capture (Geolocation API)                │   │
│  │  - Gamified Quiz Interface                           │   │
│  │  - Report Visualization                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Layer (Routers)                                  │   │
│  │  - /air-quality                                       │   │
│  │  - /soil-data                                         │   │
│  │  - /lifestyle                                         │   │
│  │  - /health-report                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Business Logic (Services)                            │   │
│  │  - AirQualityService                                  │   │
│  │  - SoilService                                        │   │
│  │  - LifestyleService                                   │   │
│  │  - HealthReportService                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Data Access Layer (SQLAlchemy ORM)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables:                                              │   │
│  │  - users                                              │   │
│  │  - environmental_data                                 │   │
│  │  - lifestyle_data                                     │   │
│  │  - health_reports                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Location Capture Flow
```
User → Browser Geolocation → Frontend → Backend API
```

### 2. Environmental Analysis Flow
```
Coordinates → Air Quality Service → Mock/API Data → Database
            → Soil Service → Mock/API Data → Database
```

### 3. Lifestyle Data Flow
```
Quiz Answers → Frontend Form → POST /lifestyle → 
Lifestyle Service → Risk Calculation → Database
```

### 4. Health Report Generation Flow
```
Location + Lifestyle ID → POST /health-report →
HealthReportService:
  1. Fetch Air Quality Data
  2. Fetch Soil Data
  3. Retrieve Lifestyle Data
  4. Calculate Environmental Risk (70% air, 30% soil)
  5. Calculate Combined Risk (60% env, 40% lifestyle)
  6. Generate Contributing Factors
  7. Generate Recommendations
  8. Create Feature Vector (for ML)
  9. Store Report
→ Return Personalized Report
```

## Component Responsibilities

### Frontend Components
- **index.html**: UI structure, forms, report display
- **app.js**: State management, API calls, UI updates
- **styles.css**: Responsive design, animations, theming

### Backend Components

#### Routers (API Endpoints)
- **air_quality.py**: GET /air-quality
- **soil.py**: GET /soil-data
- **lifestyle.py**: POST /lifestyle
- **health_report.py**: POST /health-report

#### Services (Business Logic)
- **air_quality_service.py**: AQI calculation, pollutant analysis
- **soil_service.py**: Soil risk assessment
- **lifestyle_service.py**: Lifestyle risk scoring
- **health_report_service.py**: Combined report generation

#### Models (Database)
- **user.py**: User authentication data
- **environmental_data.py**: Air & soil measurements
- **lifestyle_data.py**: Health behaviors
- **health_report.py**: Generated reports + feature vectors

#### Schemas (Validation)
- **Pydantic models**: Request/response validation
- **Type safety**: Automatic API documentation

## Security Layers

```
1. Input Validation (Pydantic schemas)
2. SQL Injection Prevention (SQLAlchemy ORM)
3. CORS Configuration (FastAPI middleware)
4. Environment Variables (.env for secrets)
5. Future: JWT Authentication
```

## Scalability Considerations

### Current (MVP)
- Single server deployment
- Mock data for environmental APIs
- Rule-based risk scoring
- SQLite/PostgreSQL database

### Future Enhancements
- **Microservices**: Separate air/soil/report services
- **Caching**: Redis for API responses
- **Queue**: Celery for async report generation
- **CDN**: Static frontend assets
- **ML Pipeline**: Separate prediction service
- **Real APIs**: Integration with AirNow, OpenWeatherMap
- **Authentication**: OAuth2/JWT with user accounts

## ML Integration Path

```
Current State:
  Rules-based scoring → Health Report

Future State:
  Collected Data → Feature Engineering → 
  ML Model Training → Predictions → 
  Explainable AI (SHAP) → Enhanced Reports
```

## Database Schema

```sql
-- Users (for authentication)
users
  - id (PK)
  - email, username
  - hashed_password
  - timestamps

-- Environmental measurements
environmental_data
  - id (PK)
  - user_id (FK, nullable)
  - latitude, longitude
  - aqi, pm25, pm10, co, no2, so2, o3
  - soil_type, soil_ph, contamination_risk
  - created_at

-- Lifestyle behaviors
lifestyle_data
  - id (PK)
  - user_id (FK, nullable)
  - age_range, gender
  - smoking_status, activity_level
  - work_environment, diet, sleep, stress
  - quiz_responses (JSON)
  - timestamps

-- Generated reports
health_reports
  - id (PK)
  - user_id (FK, nullable)
  - risk_score, risk_level
  - environmental_risk, lifestyle_risk
  - contributing_factors (JSON)
  - recommendations (JSON)
  - feature_vector (JSON) -- for ML
  - created_at
```

## API Response Times

- **/air-quality**: ~50-200ms (mock data)
- **/soil-data**: ~50-200ms (mock data)
- **/lifestyle**: ~100-300ms (includes DB write)
- **/health-report**: ~200-500ms (combines all data)

## Technology Justification

**FastAPI** - Automatic API docs, high performance, async support
**PostgreSQL** - Reliable, JSON support, ML-ready
**SQLAlchemy** - ORM flexibility, migration support
**Pydantic** - Type safety, validation, OpenAPI generation
**Vanilla JS** - No build step, lightweight, accessible

---

This architecture supports rapid MVP development while maintaining 
clear upgrade paths for production scaling and ML integration.
