import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "envhealth.db")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    try:
        cur.execute("ALTER TABLE lifestyle_data ADD COLUMN child_age_range VARCHAR")
        conn.commit()
        print("Successfully added child_age_range column.")
    except sqlite3.OperationalError as e:
        print(f"Error (maybe column exists): {e}")
    conn.close()
else:
    print(f"DB not found at {db_path}")
