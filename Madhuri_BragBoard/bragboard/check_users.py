#!/usr/bin/env python3
"""
Script to check and manage users in the BragBoard database
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.core.database import SessionLocal
from backend.app.models.user import User, Department
from backend.app.core.security import hash_password

def main():
    db = SessionLocal()
    
    try:
        # Check existing users
        users = db.query(User).all()
        print("=== Current Users in Database ===")
        if users:
            for user in users:
                print(f"Email: {user.email}")
                print(f"Name: {user.full_name}")
                print(f"Role: {user.role}")
                print(f"Department: {user.department.name if user.department else 'None'}")
                print("-" * 30)
        else:
            print("No users found in database")
        
        # Check departments
        departments = db.query(Department).all()
        print("\n=== Current Departments ===")
        if departments:
            for dept in departments:
                print(f"ID: {dept.id}, Name: {dept.name}")
        else:
            print("No departments found")
            # Create a default department
            default_dept = Department(name="General", description="Default department")
            db.add(default_dept)
            db.commit()
            print("Created default 'General' department")
        
        # Create test users if none exist
        if not users:
            print("\n=== Creating Test Users ===")
            
            # Get the department (should exist now)
            dept = db.query(Department).first()
            
            test_users = [
                {
                    "email": "test@example.com",
                    "full_name": "Test User",
                    "password": "password123",
                    "role": "employee"
                },
                {
                    "email": "admin@example.com", 
                    "full_name": "Admin User",
                    "password": "admin123",
                    "role": "admin"
                },
                {
                    "email": "manager@example.com",
                    "full_name": "Manager User", 
                    "password": "manager123",
                    "role": "manager"
                }
            ]
            
            for user_data in test_users:
                user = User(
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    hashed_password=hash_password(user_data["password"]),
                    role=user_data["role"],
                    department_id=dept.id if dept else None
                )
                db.add(user)
                print(f"Created user: {user_data['email']} / {user_data['password']} ({user_data['role']})")
            
            db.commit()
            print("\nTest users created successfully!")
        
        print(f"\n=== Login Instructions ===")
        print("You can now login with any of these credentials:")
        users = db.query(User).all()
        for user in users:
            print(f"Email: {user.email}")
            print(f"Role: {user.role}")
            print("Password: [The password you used when registering]")
            print("-" * 30)
        
        print("\nIf you created your account yesterday, use those exact credentials.")
        print("If you're having trouble, try one of the test accounts above.")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()