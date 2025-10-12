import sqlite3
import bcrypt

def check_and_create_users():
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    # Get all users
    try:
        cursor.execute('SELECT email, name FROM users')
        users = cursor.fetchall()
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"  - {user[0]} ({user[1]})")
    except:
        print("No users table found")
        users = []
    
    # Create working credentials
    if len(users) == 0:
        print("\nCreating test users...")
        
        # Create table if needed
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'employee'
            )
        ''')
        
        # Hash password
        password = "password123"
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        # Insert users
        cursor.execute('''
            INSERT OR REPLACE INTO users (email, password, name, role)
            VALUES (?, ?, ?, ?)
        ''', ('22a31a4424@gmail.com', hashed_password.decode('utf-8'), 'Puppa User', 'admin'))
        
        cursor.execute('''
            INSERT OR REPLACE INTO users (email, password, name, role)
            VALUES (?, ?, ?, ?)
        ''', ('test@test.com', hashed_password.decode('utf-8'), 'Test User', 'employee'))
        
        conn.commit()
        print("✅ Users created!")
    
    print("\n🔑 YOUR WORKING CREDENTIALS:")
    print("Email: 22a31a4424@gmail.com")
    print("Password: password123")
    print("\nOr:")
    print("Email: test@test.com")
    print("Password: password123")
    
    conn.close()

if __name__ == "__main__":
    check_and_create_users()