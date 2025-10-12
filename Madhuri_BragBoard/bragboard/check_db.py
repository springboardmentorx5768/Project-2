import os
import sqlite3

# Check what tables exist in the current database
db_path = 'bragboard.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
    tables = cursor.fetchall()
    print('Existing tables:', tables)
    
    # Check users table structure if it exists
    if tables:
        try:
            cursor.execute('PRAGMA table_info(users)')
            columns = cursor.fetchall()
            print('Users table columns:')
            for col in columns:
                print(f'  {col[1]} ({col[2]})')
                
            # Get all users
            cursor.execute('SELECT * FROM users')
            users = cursor.fetchall()
            print(f'\nFound {len(users)} users:')
            for user in users:
                print(f'  ID: {user[0]}, Email: {user[2]}')
                
        except Exception as e:
            print('Error checking users table:', e)
    
    conn.close()
else:
    print('No database file found')