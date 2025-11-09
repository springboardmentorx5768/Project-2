#!/usr/bin/env python3
"""
Database migration script to add missing timestamp columns (SQLite compatible)
"""

import sqlite3
import os
from pathlib import Path
from datetime import datetime

def add_missing_timestamp_columns():
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
        # Check which columns already exist
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = [column[1] for column in cursor.fetchall()]
        
        print(f"📊 Existing columns: {existing_columns}")
        
        # Add missing timestamp columns with NULL default (SQLite compatible)
        missing_columns = [
            ('created_at', 'DATETIME'),
            ('updated_at', 'DATETIME')
        ]
        
        current_time = datetime.now().isoformat()
        
        # Add each missing column if it doesn't exist
        for column_name, column_definition in missing_columns:
            if column_name not in existing_columns:
                try:
                    # Add column with NULL default
                    alter_sql = f"ALTER TABLE users ADD COLUMN {column_name} {column_definition}"
                    cursor.execute(alter_sql)
                    print(f"✅ Added column: {column_name}")
                    
                    # Set default value for existing users
                    update_sql = f"UPDATE users SET {column_name} = ? WHERE {column_name} IS NULL"
                    cursor.execute(update_sql, (current_time,))
                    updated_rows = cursor.rowcount
                    print(f"🔄 Updated {updated_rows} existing rows with {column_name}")
                    
                except sqlite3.Error as e:
                    print(f"⚠️  Failed to add column {column_name}: {e}")
            else:
                print(f"⏭️  Column {column_name} already exists")
        
        # Commit changes
        conn.commit()
        print("\n🎉 Timestamp columns migration completed successfully!")
        
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
    print("🔄 Starting timestamp columns migration...")
    success = add_missing_timestamp_columns()
    if success:
        print("\n✅ Migration completed successfully!")
        print("🚀 You can now restart your backend server.")
    else:
        print("\n❌ Migration failed!")
        exit(1)