import sqlite3
import bcrypt
from datetime import datetime

# Create a simple working user account
def create_user_directly():
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    # Create users table if it doesn't exist (simple version)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'employee',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Hash the password
    password = "password123"
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    # Insert user
    try:
        cursor.execute('''
            INSERT OR REPLACE INTO users (email, password, name, role)
            VALUES (?, ?, ?, ?)
        ''', ('22a31a4424@gmail.com', hashed_password.decode('utf-8'), 'Puppa User', 'admin'))
        
        cursor.execute('''
            INSERT OR REPLACE INTO users (email, password, name, role)
            VALUES (?, ?, ?, ?)
        ''', ('test@test.com', hashed_password.decode('utf-8'), 'Test User', 'employee'))
        
        conn.commit()
        print("✅ Users created successfully!")
        print("\n📝 YOUR WORKING CREDENTIALS:")
        print("Email: 22a31a4424@gmail.com")
        print("Password: password123")
        print("\nOr:")
        print("Email: test@test.com")
        print("Password: password123")
        
        # Verify users exist
        cursor.execute('SELECT email, name, role FROM users')
        users = cursor.fetchall()
        print(f"\n📊 Database now has {len(users)} users:")
        for user in users:
            print(f"  - {user[0]} ({user[1]}) - {user[2]}")
            
    except Exception as e:
        print(f"Error: {e}")
    
    conn.close()

if __name__ == "__main__":
    create_user_directly()