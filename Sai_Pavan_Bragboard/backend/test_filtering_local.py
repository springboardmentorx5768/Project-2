"""
Test department filtering manually
"""
import sys
import os
sys.path.append('.')

from app.db.session import SessionLocal
from app.crud import crud_shoutout, crud_user
from app.models.user import User
from app.models.shoutout import Shoutout

def test_department_filtering():
    """Test the department filtering logic locally"""
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Get the test user
        test_user = crud_user.get_user_by_email(db, email="test@example.com")
        if not test_user:
            print("❌ Test user not found")
            return
            
        print(f"✅ Test user found: {test_user.email}")
        print(f"   User ID: {test_user.id}")
        print(f"   Department: {test_user.department}")
        
        # Test getting shoutouts with the new filtering
        shoutouts = crud_shoutout.get_shoutouts(db, current_user_id=test_user.id)
        print(f"\n✅ Retrieved {len(shoutouts)} shoutouts for user")
        
        # Show details of each shoutout
        for i, shoutout in enumerate(shoutouts):
            print(f"\n  Shoutout {i+1}:")
            print(f"    ID: {shoutout.id}")
            print(f"    Message: {shoutout.message[:50]}...")
            print(f"    Sender ID: {shoutout.sender_id}")
            print(f"    Is for all users: {shoutout.is_all}")
            print(f"    Target department: {shoutout.target_department}")
            
            # Check recipients
            recipients = [r.email for r in shoutout.recipients]
            print(f"    Recipients: {recipients}")
            
            # Explain why this shoutout is visible
            if shoutout.is_all:
                reason = "Visible to all users"
            elif shoutout.sender_id == test_user.id:
                reason = "User is the sender"
            elif test_user.email in recipients:
                reason = "User is a recipient"
            elif shoutout.target_department == test_user.department:
                reason = f"User is in target department ({test_user.department})"
            else:
                reason = "Unknown reason (this shouldn't happen!)"
            
            print(f"    Visibility reason: {reason}")
        
        # Test creating a department-specific shoutout
        print(f"\n📝 Creating department-specific shoutout for {test_user.department}...")
        from app.schemas.shoutout import ShoutoutCreate
        
        new_shoutout_data = ShoutoutCreate(
            message="Test department-specific shoutout for Engineering team",
            recipients=[test_user.id],
            is_all=False,
            target_department="Engineering"
        )
        
        created_shoutout = crud_shoutout.create_shoutout(
            db=db, 
            shoutout=new_shoutout_data, 
            sender_id=test_user.id
        )
        
        print(f"✅ Created shoutout ID: {created_shoutout.id}")
        print(f"   Is for all: {created_shoutout.is_all}")
        print(f"   Target department: {created_shoutout.target_department}")
        
        # Test filtering again to see if the new shoutout appears
        print(f"\n🔍 Testing filtering again...")
        shoutouts_after = crud_shoutout.get_shoutouts(db, current_user_id=test_user.id)
        print(f"✅ Now showing {len(shoutouts_after)} shoutouts")
        
        # Find the new shoutout
        new_shoutout = next((s for s in shoutouts_after if s.id == created_shoutout.id), None)
        if new_shoutout:
            print(f"✅ New department-specific shoutout is visible to user")
        else:
            print(f"❌ New department-specific shoutout is NOT visible to user")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_department_filtering()