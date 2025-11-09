import sqlite3
import os

db_path = "dev.db"
if os.path.exists(db_path):
    print(f"Database {db_path} exists")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print("Existing tables:", [table[0] for table in tables])
    
    # Check shoutouts table structure if it exists
    if ('shoutouts',) in tables:
        cursor.execute("PRAGMA table_info(shoutouts)")
        columns = cursor.fetchall()
        print("\nShoutouts table columns:")
        for column in columns:
            print(f"  {column[1]} ({column[2]})")
    
    # Check if there's any data
    if ('shoutouts',) in tables:
        cursor.execute("SELECT COUNT(*) FROM shoutouts")
        count = cursor.fetchone()[0]
        print(f"\nNumber of shoutouts: {count}")
    
    if ('users',) in tables:
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        print(f"Number of users: {count}")
    
    conn.close()
else:
    print(f"Database {db_path} does not exist")