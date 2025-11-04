from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User, ActivityLog
from auth import hash_password, verify_password, create_access_token, create_refresh_token, get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

# Helper function to log activities
def log_activity(db: Session, user_id: int, action_type: str, details: str = "", ip_address: str = ""):
    """Log activity to the database"""
    try:
        activity = ActivityLog(
            user_id=user_id,
            action_type=action_type,
            details=details,
            ip_address=ip_address,
            created_at=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        print(f"Error logging activity: {e}")
        db.rollback()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str
    role: str = "employee"

class UserList(BaseModel):
    id: int
    name: str
    department: str
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    department: str
    role: str
    joined_at: str
    
    class Config:
        from_attributes = True

@router.post("/register", response_model=TokenResponse)
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Create user
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        department=user.department,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log activity
    ip_address = request.client.host if request and request.client else ""
    log_activity(
        db=db,
        user_id=new_user.id,
        action_type="user_registered",
        details=f"{new_user.name} ({new_user.department})",
        ip_address=ip_address
    )
    
    # Create tokens
    access_token = create_access_token(data={"sub": new_user.email})
    refresh_token = create_refresh_token(data={"sub": new_user.email})
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
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
        name=current_user.name,
        email=current_user.email,
        department=current_user.department,
        role=current_user.role,
        joined_at=current_user.joined_at.isoformat()
    )

@router.get("/list", response_model=List[UserList])
def list_users(
    department: str = None,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of users filtered by department and/or search term"""
    query = db.query(User).filter(User.id != current_user.id)  # Exclude current user
    
    if department and department != "all":
        query = query.filter(User.department == department)
    
    if search:
        query = query.filter(User.name.ilike(f"%{search}%"))
    
    users = query.all()
    return users

@router.get("/all", response_model=List[UserProfile])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = db.query(User).all()
    return [
        UserProfile(
            id=user.id,
            name=user.name,
            email=user.email,
            department=user.department,
            role=user.role,
            joined_at=user.joined_at.isoformat()
        )
        for user in users
    ]

@router.delete("/me/delete")
def delete_my_account(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete your own account"""
    # Store user info before deletion
    deleted_user_name = current_user.name
    deleted_user_email = current_user.email
    deleted_user_id = current_user.id
    
    # Log activity before deletion
    ip_address = request.client.host if request and request.client else ""
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="account_deleted",
        details=f"{deleted_user_name} deleted their own account",
        ip_address=ip_address
    )
    
    # Delete the user
    db.delete(current_user)
    db.commit()
    
    return {
        "message": f"Account {deleted_user_email} has been permanently deleted",
        "deleted_user": deleted_user_name
    }

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a user (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Store user info before deletion
    deleted_user_name = user.name
    deleted_user_email = user.email
    
    db.delete(user)
    db.commit()
    
    # Log activity
    ip_address = request.client.host if request and request.client else ""
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="user_deleted",
        details=f"{deleted_user_name} ({deleted_user_email})",
        ip_address=ip_address
    )
    
    return {"message": "User deleted successfully"}

