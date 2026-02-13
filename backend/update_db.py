import sqlite3

def update_db():
    conn = sqlite3.connect('childsafeenvirons.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE health_reports ADD COLUMN is_paid INTEGER DEFAULT 0")
        print("Added is_paid column")
    except sqlite3.OperationalError:
        print("is_paid column already exists")
        
    try:
        cursor.execute("ALTER TABLE health_reports ADD COLUMN stripe_session_id TEXT")
        print("Added stripe_session_id column")
    except sqlite3.OperationalError:
        print("stripe_session_id column already exists")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    update_db()
