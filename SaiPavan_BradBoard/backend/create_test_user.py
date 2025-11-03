#!/usr/bin/env python3
"""
Script to create a test user without dropping the database
"""
import sys
import os
sys.path.append('.')

from app.db.session import SessionLocal
from app import models
from app.core.security import get_password_hash

def create_test_user():
    db = SessionLocal()
    try:
        # Check existing users
        users = db.query(models.User).all()
        print(f"Found {len(users)} existing users:")
        for user in users:
            print(f"  - {user.email} ({user.department})")
        
        # Check if test user exists
        test_user = db.query(models.User).filter(models.User.email == 'test@example.com').first()
        if test_user:
            print("✅ Test user already exists")
            return
        
        # Create test user
        print("Creating test user...")
        new_user = models.User(
            email='test@example.com',
            full_name='Test User',
            department='Engineering', 
            hashed_password=get_password_hash('password123'),
            is_active=True,
            is_superuser=False
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print("✅ Test user created successfully!")
        print("   Email: test@example.com")
        print("   Password: password123")
        print("   Department: Engineering")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()