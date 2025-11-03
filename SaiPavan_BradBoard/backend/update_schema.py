import sqlite3
import os

db_path = "dev.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(shoutouts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print("Current columns:", columns)
        
        # Add is_all column if it doesn't exist
        if 'is_all' not in columns:
            print("Adding is_all column...")
            cursor.execute("ALTER TABLE shoutouts ADD COLUMN is_all BOOLEAN DEFAULT TRUE")
            print("Added is_all column")
        else:
            print("is_all column already exists")
        
        # Add target_department column if it doesn't exist
        if 'target_department' not in columns:
            print("Adding target_department column...")
            cursor.execute("ALTER TABLE shoutouts ADD COLUMN target_department VARCHAR")
            print("Added target_department column")
        else:
            print("target_department column already exists")
        
        # Set default values for existing shoutouts
        cursor.execute("UPDATE shoutouts SET is_all = TRUE WHERE is_all IS NULL")
        print("Set default values for existing shoutouts")
        
        conn.commit()
        print("Database schema updated successfully!")
        
        # Check the updated structure
        cursor.execute("PRAGMA table_info(shoutouts)")
        columns = cursor.fetchall()
        print("\nUpdated shoutouts table columns:")
        for column in columns:
            print(f"  {column[1]} ({column[2]})")
            
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()
else:
    print(f"Database {db_path} does not exist")