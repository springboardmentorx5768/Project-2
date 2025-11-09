"""
Comprehensive test of department filtering
"""
import sys
sys.path.append('.')

from app.db.session import SessionLocal
from app.crud import crud_shoutout, crud_user
from app.schemas.shoutout import ShoutoutCreate

def test_cross_department_filtering():
    """Test department filtering with users from different departments"""
    
    db = SessionLocal()
    
    try:
        # Get users from different departments
        eng_user = crud_user.get_user_by_email(db, email="test@example.com")
        hr_user = crud_user.get_user_by_email(db, email="hr@example.com")
        
        print(f"🔍 Testing department filtering...")
        print(f"   Engineering user: {eng_user.email} (ID: {eng_user.id})")
        print(f"   HR user: {hr_user.email} (ID: {hr_user.id})")
        
        # 1. Create an Engineering-specific shoutout
        print(f"\n📝 Creating Engineering-specific shoutout...")
        eng_shoutout_data = ShoutoutCreate(
            message="Engineering team meeting at 3 PM",
            is_all=False,
            target_department="Engineering"
        )
        
        eng_shoutout = crud_shoutout.create_shoutout(
            db=db, 
            shoutout=eng_shoutout_data, 
            sender_id=eng_user.id
        )
        print(f"   Created shoutout ID: {eng_shoutout.id}")
        print(f"   Target department: {eng_shoutout.target_department}")
        
        # 2. Create an HR-specific shoutout
        print(f"\n📝 Creating HR-specific shoutout...")
        hr_shoutout_data = ShoutoutCreate(
            message="HR policy update - please review",
            is_all=False,
            target_department="HR"
        )
        
        hr_shoutout = crud_shoutout.create_shoutout(
            db=db, 
            shoutout=hr_shoutout_data, 
            sender_id=hr_user.id
        )
        print(f"   Created shoutout ID: {hr_shoutout.id}")
        print(f"   Target department: {hr_shoutout.target_department}")
        
        # 3. Create an all-users shoutout
        print(f"\n📝 Creating all-users shoutout...")
        all_shoutout_data = ShoutoutCreate(
            message="Company picnic next Friday!",
            is_all=True
        )
        
        all_shoutout = crud_shoutout.create_shoutout(
            db=db, 
            shoutout=all_shoutout_data, 
            sender_id=eng_user.id
        )
        print(f"   Created shoutout ID: {all_shoutout.id}")
        print(f"   Is for all users: {all_shoutout.is_all}")
        
        # 4. Test what Engineering user sees
        print(f"\n🔍 Testing what Engineering user sees...")
        eng_shoutouts = crud_shoutout.get_shoutouts(db, current_user_id=eng_user.id)
        eng_new_shoutouts = [s for s in eng_shoutouts if s.id in [eng_shoutout.id, hr_shoutout.id, all_shoutout.id]]
        
        print(f"   Engineering user sees {len(eng_new_shoutouts)} of our new shoutouts:")
        for shoutout in eng_new_shoutouts:
            if shoutout.id == eng_shoutout.id:
                reason = "✅ Engineering-specific shoutout (user in Engineering)"
            elif shoutout.id == hr_shoutout.id:
                reason = "❌ HR-specific shoutout (user NOT in HR) - THIS SHOULDN'T BE VISIBLE"
            elif shoutout.id == all_shoutout.id:
                reason = "✅ All-users shoutout"
            else:
                reason = "❓ Unknown shoutout"
                
            print(f"     - ID {shoutout.id}: {shoutout.message[:30]}... ({reason})")
        
        # 5. Test what HR user sees
        print(f"\n🔍 Testing what HR user sees...")
        hr_shoutouts = crud_shoutout.get_shoutouts(db, current_user_id=hr_user.id)
        hr_new_shoutouts = [s for s in hr_shoutouts if s.id in [eng_shoutout.id, hr_shoutout.id, all_shoutout.id]]
        
        print(f"   HR user sees {len(hr_new_shoutouts)} of our new shoutouts:")
        for shoutout in hr_new_shoutouts:
            if shoutout.id == eng_shoutout.id:
                reason = "❌ Engineering-specific shoutout (user NOT in Engineering) - THIS SHOULDN'T BE VISIBLE"
            elif shoutout.id == hr_shoutout.id:
                reason = "✅ HR-specific shoutout (user in HR)"
            elif shoutout.id == all_shoutout.id:
                reason = "✅ All-users shoutout"
            else:
                reason = "❓ Unknown shoutout"
                
            print(f"     - ID {shoutout.id}: {shoutout.message[:30]}... ({reason})")
        
        # Summary
        print(f"\n📊 Summary:")
        eng_should_see = [eng_shoutout.id, all_shoutout.id]  # Should NOT see hr_shoutout
        hr_should_see = [hr_shoutout.id, all_shoutout.id]    # Should NOT see eng_shoutout
        
        eng_actually_sees = [s.id for s in eng_new_shoutouts]
        hr_actually_sees = [s.id for s in hr_new_shoutouts]
        
        eng_correct = set(eng_should_see) == set(eng_actually_sees)
        hr_correct = set(hr_should_see) == set(hr_actually_sees)
        
        print(f"   Engineering user filtering: {'✅ CORRECT' if eng_correct else '❌ INCORRECT'}")
        print(f"     Should see: {eng_should_see}")
        print(f"     Actually sees: {eng_actually_sees}")
        
        print(f"   HR user filtering: {'✅ CORRECT' if hr_correct else '❌ INCORRECT'}")
        print(f"     Should see: {hr_should_see}")
        print(f"     Actually sees: {hr_actually_sees}")
        
        if eng_correct and hr_correct:
            print(f"\n🎉 Department filtering is working correctly!")
        else:
            print(f"\n⚠️  Department filtering needs adjustment!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_cross_department_filtering()