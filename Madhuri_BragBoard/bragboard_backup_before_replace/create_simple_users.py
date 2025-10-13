import sys
import os
sys.path.append('backend')

from backend.app.core.database import SessionLocal
from backend.app.models.user import User
from backend.app.core.security import get_password_hash

def create_simple_users():
    db = SessionLocal()
    
    try:
        # Create test users without departments for now
        test_users = [
            {
                "email": "22a31a4424@gmail.com",  # Your original email
                "full_name": "Puppa User", 
                "password": "password123",
                "role": "admin"
            },
            {
                "email": "test@example.com",
                "full_name": "Test User",
                "password": "test123", 
                "role": "employee"
            }
        ]
        
        print("Creating simple test users...")
        for user_data in test_users:
            # Check if user already exists
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if existing:
                print(f"⚠️  User {user_data['email']} already exists")
                continue
                
            user = User(
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                is_active=True,
                department_id=None  # No department for now
            )
            db.add(user)
            print(f"✅ Created: {user_data['email']} / {user_data['password']} ({user_data['role']})")
        
        db.commit()
        print("\n🎉 Test users created successfully!")
        print("\n📝 YOU CAN NOW LOGIN WITH:")
        print("Email: 22a31a4424@gmail.com")
        print("Password: password123")
        print("\nOr:")
        print("Email: test@example.com") 
        print("Password: test123")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_simple_users()