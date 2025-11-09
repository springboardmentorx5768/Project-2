#!/usr/bin/env python3

"""
Script to add new columns to the users table.
Run this to update the database schema with bio, location, phone, created_at, updated_at fields.
"""

import sqlite3
import os
from pathlib import Path

def update_database_schema():
    # Find the database file
    db_path = Path("./dev.db")
    if not db_path.exists():
        print(f"Database file {db_path} not found!")
        return False

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = [row[1] for row in cursor.fetchall()]
        
        print(f"Existing columns: {existing_columns}")

        # Add new columns if they don't exist
        new_columns = [
            ("bio", "TEXT"),
            ("location", "TEXT"), 
            ("phone", "TEXT"),
            ("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP")
        ]

        for column_name, column_type in new_columns:
            if column_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
                    print(f"✅ Added column: {column_name}")
                except sqlite3.Error as e:
                    print(f"❌ Error adding column {column_name}: {e}")
            else:
                print(f"⏭️ Column {column_name} already exists")

        # Create trigger for updated_at
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_users_updated_at
            AFTER UPDATE ON users
            FOR EACH ROW
            BEGIN
                UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
        """)
        print("✅ Created/updated trigger for updated_at")

        conn.commit()
        conn.close()
        print("✅ Database schema updated successfully!")
        return True

    except Exception as e:
        print(f"❌ Error updating database: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Updating database schema...")
    success = update_database_schema()
    if success:
        print("🎉 Schema update completed!")
    else:
        print("💥 Schema update failed!")