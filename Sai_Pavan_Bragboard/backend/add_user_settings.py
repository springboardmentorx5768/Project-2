#!/usr/bin/env python3
"""
Database migration script to add user settings columns
"""

import sqlite3
import os
from pathlib import Path

def add_user_settings_columns():
    # Get the database path
    backend_dir = Path(__file__).parent
    db_path = backend_dir / "dev.db"
    
    if not db_path.exists():
        print("❌ Database file not found. Please ensure the backend has been run at least once.")
        return False
    
    print(f"📍 Working with database: {db_path}")
    
    # Connect to the database
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        # List of new settings columns to add
        new_columns = [
            ('email_notifications', 'BOOLEAN DEFAULT 1'),
            ('push_notifications', 'BOOLEAN DEFAULT 0'),
            ('weekly_digest', 'BOOLEAN DEFAULT 1'),
            ('public_profile', 'BOOLEAN DEFAULT 1'),
            ('show_email', 'BOOLEAN DEFAULT 0'),
            ('show_phone', 'BOOLEAN DEFAULT 0'),
            ('theme', 'VARCHAR DEFAULT "light"'),
            ('language', 'VARCHAR DEFAULT "en"')
        ]
        
        # Check which columns already exist
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = [column[1] for column in cursor.fetchall()]
        
        print(f"📊 Existing columns: {existing_columns}")
        
        # Add each new column if it doesn't exist
        for column_name, column_definition in new_columns:
            if column_name not in existing_columns:
                try:
                    alter_sql = f"ALTER TABLE users ADD COLUMN {column_name} {column_definition}"
                    cursor.execute(alter_sql)
                    print(f"✅ Added column: {column_name}")
                except sqlite3.Error as e:
                    print(f"⚠️  Failed to add column {column_name}: {e}")
            else:
                print(f"⏭️  Column {column_name} already exists")
        
        # Commit changes
        conn.commit()
        print("\n🎉 Database migration completed successfully!")
        
        # Verify the new schema
        print("\n📋 Updated table schema:")
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        for col in columns:
            print(f"   - {col[1]} ({col[2]})")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Starting user settings migration...")
    success = add_user_settings_columns()
    if success:
        print("\n✅ Migration completed successfully!")
        print("🚀 You can now restart your backend server to use the new settings functionality.")
    else:
        print("\n❌ Migration failed!")
        exit(1)