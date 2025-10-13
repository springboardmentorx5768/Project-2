from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, and_
from app.models.user import User, Department, Achievement
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from typing import Optional, List
from datetime import datetime

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email with department info."""
    return db.query(User).options(joinedload(User.dept)).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID with department info."""
    return db.query(User).options(joinedload(User.dept)).filter(User.id == user_id).first()

def get_users(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    department_id: Optional[int] = None,
    role: Optional[str] = None
) -> List[User]:
    """Get users with optional filtering."""
    query = db.query(User).options(joinedload(User.dept))
    
    if department_id:
        query = query.filter(User.department_id == department_id)
    if role:
        query = query.filter(User.role == role)
    
    return query.offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user."""
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create user instance
    db_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        department_id=user.department_id,
        role=user.role,
        bio=user.bio,
        profile_picture=user.profile_picture
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise ValueError("Email already registered")

def update_user(db: Session, user_id: int, user: UserUpdate) -> Optional[User]:
    """Update user information."""
    db_user = get_user_by_id(db, user_id)
    if db_user:
        update_data = user.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def update_user_last_login(db: Session, user_id: int):
    """Update user's last login timestamp."""
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db_user.last_login = datetime.utcnow()
        db.commit()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password."""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not user.is_active:
        return None
    if not verify_password(password, user.password):
        return None
    
    # Update last login
    update_user_last_login(db, user.id)
    return user

def get_user_with_stats(db: Session, user_id: int):
    """Get user with achievement statistics."""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    achievement_count = db.query(func.count(Achievement.id)).filter(Achievement.user_id == user_id).scalar()
    total_points = db.query(func.sum(Achievement.points)).filter(Achievement.user_id == user_id).scalar() or 0
    
    user_dict = user.__dict__.copy()
    user_dict['achievement_count'] = achievement_count
    user_dict['total_points'] = total_points
    user_dict['department_name'] = user.dept.name if user.dept else None
    
    return user_dict

def can_access_department(user: User, department_id: int) -> bool:
    """Check if user can access specific department data."""
    if user.role == "admin":
        return True
    if user.role == "manager" and user.department_id == department_id:
        return True
    if user.department_id == department_id:
        return True
    return False