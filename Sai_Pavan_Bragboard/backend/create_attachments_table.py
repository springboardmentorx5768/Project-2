#!/usr/bin/env python3
"""
Migration script to create attachments table for multiple file support
"""

import sqlite3
from datetime import datetime

def create_attachments_table():
    """Create attachments table"""
    conn = sqlite3.connect('dev.db')
    cursor = conn.cursor()
    
    try:
        # Check if table already exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='attachments'")
        if cursor.fetchone():
            print("✅ Attachments table already exists")
            conn.close()
            return
        
        print("Creating attachments table...")
        cursor.execute('''
            CREATE TABLE attachments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                unique_filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_url TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                mime_type TEXT,
                shoutout_id INTEGER NOT NULL,
                uploaded_by INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (shoutout_id) REFERENCES shoutouts (id),
                FOREIGN KEY (uploaded_by) REFERENCES users (id)
            )
        ''')
        
        # Create indexes for better performance
        cursor.execute('CREATE INDEX idx_attachments_shoutout_id ON attachments (shoutout_id)')
        cursor.execute('CREATE INDEX idx_attachments_uploaded_by ON attachments (uploaded_by)')
        
        conn.commit()
        print("✅ Attachments table created successfully")
        
        # Check final state
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        all_tables = [row[0] for row in cursor.fetchall()]
        print(f"All tables: {all_tables}")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_attachments_table()
    print("Migration completed!")