import sqlite3
import os

db_path = "childsafeenvirons.db"

if not os.path.exists(db_path):
    print(f"Database file {db_path} NOT FOUND")
else:
    print(f"Database file {db_path} found")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("Tables:", tables)
        
        for table in tables:
            tname = table[0]
            print(f"\nSchema for {tname}:")
            cursor.execute(f"PRAGMA table_info({tname});")
            columns = cursor.fetchall()
            for col in columns:
                print(col)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
