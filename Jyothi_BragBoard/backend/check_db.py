from database import SessionLocal
from database_models import User

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users in database: {len(users)}")
        print("\nUser details:")
        for user in users:
            print(f"ID: {user.id}")
            print(f"Name: {user.name}")
            print(f"Email: {user.email}")
            print(f"Department: {user.department}")
            print(f"Role: {user.role}")
            print(f"Joined: {user.joined_at}")
            print(f"Password (hashed): {user.password[:20]}...")
            print("-" * 50)
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
