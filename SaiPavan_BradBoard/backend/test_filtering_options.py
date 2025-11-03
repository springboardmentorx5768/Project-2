"""
Test the new filtering functionality
"""
import sys
sys.path.append('.')

from app.db.session import SessionLocal
from app.crud import crud_shoutout, crud_user
from datetime import date, timedelta

def test_filtering():
    """Test the new filtering options"""
    
    db = SessionLocal()
    
    try:
        # Get test users
        eng_user = crud_user.get_user_by_email(db, email="test@example.com")
        hr_user = crud_user.get_user_by_email(db, email="hr@example.com")
        
        print("🔍 Testing new filtering functionality...")
        print(f"   Engineering user: {eng_user.email} (ID: {eng_user.id})")
        print(f"   HR user: {hr_user.email} (ID: {hr_user.id})")
        
        # Test 1: Get all shoutouts (no filters)
        print(f"\n1️⃣ Testing: All shoutouts (no filters)")
        all_shoutouts = crud_shoutout.get_shoutouts(db, current_user_id=eng_user.id)
        print(f"   Result: {len(all_shoutouts)} shoutouts")
        
        # Test 2: Filter by department
        print(f"\n2️⃣ Testing: Filter by department 'Engineering'")
        eng_dept_shoutouts = crud_shoutout.get_shoutouts(
            db, 
            current_user_id=eng_user.id,
            department_filter="Engineering"
        )
        print(f"   Result: {len(eng_dept_shoutouts)} shoutouts")
        for s in eng_dept_shoutouts:
            print(f"     - ID {s.id}: {s.target_department} - {s.message[:30]}...")
        
        # Test 3: Filter by sender
        print(f"\n3️⃣ Testing: Filter by sender ID {eng_user.id}")
        sender_shoutouts = crud_shoutout.get_shoutouts(
            db, 
            current_user_id=eng_user.id,
            sender_id_filter=eng_user.id
        )
        print(f"   Result: {len(sender_shoutouts)} shoutouts")
        for s in sender_shoutouts:
            print(f"     - ID {s.id}: Sender ID {s.sender_id} - {s.message[:30]}...")
        
        # Test 4: Filter by date range (last 7 days)
        print(f"\n4️⃣ Testing: Filter by date (last 7 days)")
        date_from = date.today() - timedelta(days=7)
        date_to = date.today()
        recent_shoutouts = crud_shoutout.get_shoutouts(
            db, 
            current_user_id=eng_user.id,
            date_from=date_from,
            date_to=date_to
        )
        print(f"   Result: {len(recent_shoutouts)} shoutouts from {date_from} to {date_to}")
        for s in recent_shoutouts:
            print(f"     - ID {s.id}: {s.created_at.date()} - {s.message[:30]}...")
        
        # Test 5: Get available departments
        print(f"\n5️⃣ Testing: Available departments")
        departments = crud_shoutout.get_available_departments(db, eng_user.id)
        print(f"   Result: {departments}")
        
        # Test 6: Get available senders
        print(f"\n6️⃣ Testing: Available senders")
        senders = crud_shoutout.get_available_senders(db, eng_user.id)
        print(f"   Result: {len(senders)} senders")
        for sender in senders:
            print(f"     - ID {sender['id']}: {sender['full_name']} ({sender['email']})")
        
        print(f"\n✅ All filtering tests completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_filtering()