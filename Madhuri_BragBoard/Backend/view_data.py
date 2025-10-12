#!/usr/bin/env python3
"""
Simple script to view BragBoard data from PostgreSQL database
"""

from database import SessionLocal
from models import User, ShoutOut
from sqlalchemy import func

def view_all_data():
    """Display all data from the database"""
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("BRAGBOARD DATABASE VIEWER")
        print("=" * 60)
        
        # Count records
        user_count = db.query(User).count()
        shoutout_count = db.query(ShoutOut).count()
        
        print(f"\nSUMMARY:")
        print(f"   Users: {user_count}")
        print(f"   Shoutouts: {shoutout_count}")
        
        # Display Users
        print(f"\nUSERS ({user_count}):")
        print("-" * 40)
        users = db.query(User).all()
        
        if users:
            for user in users:
                print(f"ID: {user.id} | {user.name} ({user.email})")
                print(f"   Department: {user.department} | Role: {user.role}")
                print(f"   Joined: {user.joined_at}")
                print()
        else:
            print("   No users found. Register some users first!")
        
        # Display Shoutouts
        print(f"\nSHOUTOUTS ({shoutout_count}):")
        print("-" * 40)
        shoutouts = db.query(ShoutOut).all()
        
        if shoutouts:
            for shout in shoutouts:
                giver = db.query(User).filter(User.id == shout.giver_id).first()
                receiver = db.query(User).filter(User.id == shout.receiver_id).first()
                
                print(f"ID: {shout.id} | {shout.title}")
                print(f"   From: {giver.name if giver else 'Unknown'} -> To: {receiver.name if receiver else 'Unknown'}")
                print(f"   Category: {shout.category} | Visibility: {shout.is_public}")
                print(f"   Message: {shout.message}")
                print(f"   Created: {shout.created_at}")
                print()
        else:
            print("   No shoutouts found. Create some shoutouts first!")
            
        print("=" * 60)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

def view_users_only():
    """Display only users"""
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        print("\nALL USERS:")
        print("-" * 30)
        
        if users:
            for user in users:
                print(f"{user.id}: {user.name} ({user.email}) - {user.department}")
        else:
            print("No users found.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

def view_shoutouts_only():
    """Display only shoutouts"""
    db = SessionLocal()
    
    try:
        shoutouts = db.query(ShoutOut).all()
        print("\nALL SHOUTOUTS:")
        print("-" * 30)
        
        if shoutouts:
            for shout in shoutouts:
                print(f"{shout.id}: {shout.title} - {shout.category}")
        else:
            print("No shoutouts found.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "users":
            view_users_only()
        elif sys.argv[1] == "shoutouts":
            view_shoutouts_only()
        else:
            print("Usage: python view_data.py [users|shoutouts]")
    else:
        view_all_data()
