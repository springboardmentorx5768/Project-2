#!/usr/bin/env python3
"""
Test account registration and persistence
"""

import sqlite3
import requests
import json
import random

def test_registration():
    print("🧪 Testing Account Registration & Persistence")
    print("=" * 50)
    
    # Test data
    random_id = random.randint(1000, 9999)
    new_user = {
        "email": f"testpersist{random_id}@example.com",
        "password": "testpass123",
        "full_name": "Test Persistence User"
    }
    
    # Try to register
    try:
        print("📝 Registering new user...")
        response = requests.post(
            "http://127.0.0.1:8000/api/auth/register",
            json=new_user,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Registration successful!")
            user_data = response.json()
            print(f"   User ID: {user_data['user']['id']}")
            print(f"   Email: {user_data['user']['email']}")
            print(f"   Name: {user_data['user']['name']}")
            print(f"   Role: {user_data['user']['role']}")
            print(f"   Department: {user_data['user'].get('department_name', 'N/A')}")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server.")
        print("   Make sure the backend is running on http://127.0.0.1:8000")
        return
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        return
    
    # Check database directly
    print("\n🔍 Checking database directly...")
    try:
        conn = sqlite3.connect('bragboard.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, email, name, role, department_id FROM users WHERE email = ?', 
                      (new_user['email'],))
        user = cursor.fetchone()
        
        if user:
            print("✅ User found in database!")
            print(f"   ID: {user[0]}")
            print(f"   Email: {user[1]}")
            print(f"   Name: {user[2]}")
            print(f"   Role: {user[3]}")
            print(f"   Department ID: {user[4]}")
        else:
            print("❌ User not found in database!")
        
        # Count total users
        cursor.execute('SELECT COUNT(*) FROM users')
        total_users = cursor.fetchone()[0]
        print(f"\n📊 Total users in database: {total_users}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Persistence Test Results:")
    print("   1. If registration succeeded AND user found in DB = ✅ PERSISTENT")
    print("   2. If registration failed or user not in DB = ❌ NOT PERSISTENT")

if __name__ == "__main__":
    test_registration()