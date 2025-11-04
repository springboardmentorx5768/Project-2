from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from database_models import User
from auth import hash_password, verify_password, create_access_token, create_refresh_token, get_current_user
from schemas import UserCreate, TokenResponse, UserLogin, UserProfile, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])



@router.post("/register", response_model=TokenResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Create user
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        department=user.department,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create tokens
    access_token = create_access_token(data={"sub": new_user.email})
    refresh_token = create_refresh_token(data={"sub": new_user.email})
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create tokens
    access_token = create_access_token(data={"sub": db_user.email})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.get("/profile", response_model=UserProfile)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile information"""
    return UserProfile(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        department=current_user.department,
        role=current_user.role,
        joined_at=current_user.joined_at.isoformat()
    )

@router.get("/all")
def get_all_users(db: Session = Depends(get_db)):
    """Return all users (for tagging, feed display, etc.)"""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "department": u.department,
            "role": u.role,
        }
        for u in users
    ]


@router.put("/{user_id}")
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Employees can update only their own data; admins can update any user
    if current_user.id != user_id and current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this user")

    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update only provided fields
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return {
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "department": db_user.department,
        "role": db_user.role,
    }

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Employees can delete only their own account; admins can delete any account
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"detail": "User deleted successfully"}
