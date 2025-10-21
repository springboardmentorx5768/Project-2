from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def get_user_by_email_and_department(db: Session, email: str, department: str):
    """
    Reads a single user from the database by their email and department.
    """
    # FIX: Changed models.User to User
    return db.query(User).filter(
        User.email == email,
        User.department == department
    ).first()

def create_user(db: Session, user: UserCreate):
    hashed_pass = hash_password(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_pass,
        department=user.department
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user