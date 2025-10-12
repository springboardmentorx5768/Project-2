import sys
import os
sys.path.append('backend')

from backend.app.core.database import SessionLocal
from backend.app.models.user import User, Department
from backend.app.core.security import get_password_hash

def create_test_users():
    db = SessionLocal()
    
    try:
        # Create a default department first
        dept = Department(name="General", description="Default department for all users")
        db.add(dept)
        db.flush()  # Get the ID
        
        # Create test users including one with your email
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
            },
            {
                "email": "demo@example.com",
                "full_name": "Demo User",
                "password": "demo123", 
                "role": "manager"
            }
        ]
        
        print("Creating test users...")
        for user_data in test_users:
            user = User(
                email=user_data["email"],
                full_name=user_data["full_name"], 
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                department_id=dept.id,
                is_active=True
            )
            db.add(user)
            print(f"✅ Created: {user_data['email']} / {user_data['password']} ({user_data['role']})")
        
        db.commit()
        print("\n🎉 All test users created successfully!")
        print("\n📝 YOU CAN NOW LOGIN WITH:")
        print("Email: 22a31a4424@gmail.com")
        print("Password: password123")
        print("(This is your original email with a new password)")
        
        print("\nOr try these test accounts:")
        print("• test@example.com / test123 (employee)")
        print("• demo@example.com / demo123 (manager)")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()