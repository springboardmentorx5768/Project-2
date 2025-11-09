#!/usr/bin/env python3
"""
Migration script to create comments and reactions tables for BragBoard
"""

import sqlite3
from datetime import datetime

def create_tables():
    """Create comments and reactions tables if they don't exist"""
    conn = sqlite3.connect('dev.db')
    cursor = conn.cursor()
    
    try:
        # Check existing tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        existing_tables = [row[0] for row in cursor.fetchall()]
        print("Existing tables:", existing_tables)
        
        # Create comments table
        if 'comments' not in existing_tables:
            print("Creating comments table...")
            cursor.execute('''
                CREATE TABLE comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    user_id INTEGER NOT NULL,
                    shoutout_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (shoutout_id) REFERENCES shoutouts (id)
                )
            ''')
            print("✅ Comments table created")
        else:
            print("✅ Comments table already exists")
        
        # Create reactions table
        if 'reactions' not in existing_tables:
            print("Creating reactions table...")
            cursor.execute('''
                CREATE TABLE reactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    user_id INTEGER NOT NULL,
                    shoutout_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (shoutout_id) REFERENCES shoutouts (id),
                    UNIQUE(user_id, shoutout_id, type)
                )
            ''')
            print("✅ Reactions table created")
        else:
            print("✅ Reactions table already exists")
        
        conn.commit()
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        all_tables = [row[0] for row in cursor.fetchall()]
        print(f"\nAll tables now: {all_tables}")
        
        # Check if we have any shoutouts to add test data
        cursor.execute("SELECT COUNT(*) FROM shoutouts")
        shoutout_count = cursor.fetchone()[0]
        print(f"Number of shoutouts: {shoutout_count}")
        
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"Number of users: {user_count}")
        
        if shoutout_count > 0 and user_count > 0:
            # Add some sample comments and reactions for testing
            print("\nAdding sample comments and reactions for testing...")
            
            # Get first user and shoutout
            cursor.execute("SELECT id FROM users LIMIT 1")
            user_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT id FROM shoutouts LIMIT 1")
            shoutout_id = cursor.fetchone()[0]
            
            # Add sample comment
            cursor.execute('''
                INSERT OR IGNORE INTO comments (content, user_id, shoutout_id, created_at)
                VALUES (?, ?, ?, ?)
            ''', ("Great work! This is a test comment.", user_id, shoutout_id, datetime.utcnow()))
            
            # Add sample reactions
            for reaction_type in ['like', 'clap', 'star']:
                cursor.execute('''
                    INSERT OR IGNORE INTO reactions (type, user_id, shoutout_id, created_at)
                    VALUES (?, ?, ?, ?)
                ''', (reaction_type, user_id, shoutout_id, datetime.utcnow()))
            
            conn.commit()
            print("✅ Sample data added")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_tables()
    print("Migration completed!")