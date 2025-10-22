from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from auth import hash_password, verify_password, create_access_token, get_current_user
from database import get_db
from models import User
from datetime import datetime

router = APIRouter()

# Pydantic Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

class DashboardData(BaseModel):
    user: UserResponse
    total_posts: int
    recent_activity: list

# Auth Routes
@router.post("/signup", status_code=201)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user": {"id": new_user.id, "username": new_user.username, "email": new_user.email}}

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# Protected Routes
@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at
    )

@router.get("/dashboard", response_model=DashboardData)
def get_dashboard(current_user: User = Depends(get_current_user)):
    # Mock data for dashboard - in real app, you'd query actual posts/activity
    return DashboardData(
        user=UserResponse(
            id=current_user.id,
            username=current_user.username,
            email=current_user.email,
            created_at=current_user.created_at
        ),
        total_posts=0,  # Would query actual posts count
        recent_activity=[]  # Would query actual activity
    )

@router.post("/logout")
def logout():
    # In a real app, you might blacklist the token
    return {"message": "Successfully logged out"}
