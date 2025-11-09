"""
Create a test user in a different department
"""
import sys
sys.path.append('.')

from app.db.session import SessionLocal
from app.crud import crud_user
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def create_test_user_hr():
    """Create a test user in HR department"""
    
    db = SessionLocal()
    
    try:
        # Check if HR user already exists
        hr_user = crud_user.get_user_by_email(db, email="hr@example.com")
        if hr_user:
            print(f"✅ HR user already exists: {hr_user.email} (Department: {hr_user.department})")
            return hr_user
        
        # Create HR user
        hr_user_data = UserCreate(
            email="hr@example.com",
            password="hrpassword123",
            full_name="HR Test User",
            department="HR"
        )
        
        hr_user = crud_user.create_user(db=db, user=hr_user_data)
        print(f"✅ Created HR user: {hr_user.email} (Department: {hr_user.department})")
        
        return hr_user
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user_hr()