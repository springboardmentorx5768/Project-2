from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError

import models, schemas, auth
from database import engine, get_db
from models import User, ShoutOut, ShoutOutRecipient

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API")

# CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = auth.decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

# Register
@app.post("/register", response_model=schemas.UserResponse, status_code=201)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed_password = auth.hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        department=user.department
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Login
@app.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = auth.create_access_token(user.email)
    refresh_token = auth.create_refresh_token(user.email)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# Refresh token
from pydantic import BaseModel
class RefreshReq(BaseModel):
    refresh_token: str

@app.post("/refresh", response_model=schemas.Token)
def refresh_token(req: RefreshReq, db: Session = Depends(get_db)):
    try:
        payload = auth.decode_token(req.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not a refresh token")
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    access_token = auth.create_access_token(email)
    refresh_token = auth.create_refresh_token(email)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# Protected endpoints
@app.get("/me", response_model=schemas.UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/users", response_model=List[schemas.UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).all()

# --- Shoutouts ---
@app.get("/shoutouts", response_model=List[schemas.ShoutoutResponse])
def list_shoutouts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Filter shoutouts based on user's department
    shoutouts = db.query(ShoutOut).join(User).filter(User.department == current_user.department).all()
    results = []
    for s in shoutouts:
        recipient_names = [r.recipient.name for r in s.recipients]  # fetch recipient names
        results.append(
            schemas.ShoutoutResponse(
                id=s.id,
                message=s.message,
                sender_id=s.sender.id,
                sender_name=s.sender.name,
                sender_role=s.sender.role.value,
                sender_department=s.sender.department,
                recipient_ids=[r.recipient_id for r in s.recipients],
                recipient_names=recipient_names,
                created_at=s.created_at
            )
        )
    return results

@app.post("/shoutouts", response_model=schemas.ShoutoutResponse)
def create_shoutout(
    shoutout: schemas.ShoutoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_shout = ShoutOut(
        sender_id=current_user.id,
        message=shoutout.message
    )
    db.add(new_shout)
    db.commit()
    db.refresh(new_shout)

    # Assign recipients if recipient_ids provided
    if shoutout.recipient_ids:
        recipients = db.query(User).filter(User.id.in_(shoutout.recipient_ids)).all()
        for r in recipients:
            db.add(ShoutOutRecipient(shoutout_id=new_shout.id, recipient_id=r.id))
        db.commit()

    recipient_names = [r.recipient.name for r in new_shout.recipients]

    return schemas.ShoutoutResponse(
        id=new_shout.id,
        message=new_shout.message,
        sender_id=current_user.id,
        sender_name=current_user.name,
        sender_role=current_user.role.value,
        sender_department=current_user.department,
        recipient_ids=[r.recipient_id for r in new_shout.recipients],
        recipient_names=recipient_names,
        created_at=new_shout.created_at
    )
