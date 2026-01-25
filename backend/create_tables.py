"""
Database migration script to create initial tables
Run this after setting up your PostgreSQL database
"""

from app.database import engine, Base
from app.models import User, EnvironmentalData, LifestyleData, HealthReport

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully!")
    print("\nCreated tables:")
    print("  - users")
    print("  - environmental_data")
    print("  - lifestyle_data")
    print("  - health_reports")

if __name__ == "__main__":
    create_tables()
