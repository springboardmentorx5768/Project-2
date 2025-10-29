from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import JWTError
from datetime import date
from sqlalchemy import func
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import os
import uuid
from pathlib import Path
import json
import shutil  # fallback for file writing
from schemas import CommentCreate, CommentResponse

import aiofiles

import models, schemas, auth
from database import engine, Base, get_db
from auth import decode_token
from models import User, ShoutOut, ShoutOutRecipient, Comment
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey123")


# Create DB tables (if not exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API")

# Serve uploads folder
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS: allow from dev frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# ---------------- Helper ----------------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials"
    )
    try:
        # Helpful debug logs on server console

        payload = decode_token(token)
        
        user_id = payload.get("sub")
        if user_id is None:
            print("❌ [DEBUG] No 'sub' in payload")
            raise credentials_exception

        try:
            user_id_int = int(user_id)
        except ValueError:
            print("❌ [DEBUG] 'sub' value not convertible to int:", user_id)
            raise credentials_exception
    except JWTError as e:
        
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id_int).first()
    if not user:
        print("❌ [DEBUG] User not found for id:", user_id_int)
        raise credentials_exception

    
    return user


# ---------------- Register ----------------
@app.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_pw,
        department=user_data.department,
        role="employee",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ---------------- Login ----------------
@app.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not auth.verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth.create_access_token(subject=str(user.id))
    refresh_token = auth.create_refresh_token(subject=str(user.id))
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


# ---------------- /me ----------------
@app.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ---------------- users/department ----------------
@app.get("/users/department", response_model=List[schemas.UserResponse])
def get_users_in_department(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.department:
        raise HTTPException(status_code=400, detail="User has no department set")

    users = (
        db.query(User)
        .filter(User.department == current_user.department, User.id != current_user.id)
        .all()
    )
    return users


# ---------------- Post shoutout with file upload ----------------
@app.post("/shoutouts", response_model=schemas.ShoutoutResponse, status_code=201)
async def post_shoutout(
    message: str = Form(...),
    recipient_ids: Optional[str] = Form("[]"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Accepts form-data:
      - message (str)
      - recipient_ids (JSON string of list of ints, e.g. "[1,2]")
      - file (optional upload)
    """
    recipient_ids_list = []
    try:
        recipient_ids_list = json.loads(recipient_ids)
        if not isinstance(recipient_ids_list, list):
            recipient_ids_list = []
    except Exception:
        recipient_ids_list = []

    # Save uploaded file if present (async)
    image_url = None
    if file:
        # sanitize filename by taking base name and prefixing with uuid
        filename = Path(file.filename).name
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        try:
            async with aiofiles.open(file_path, "wb") as out_file:
                while True:
                    chunk = await file.read(1024 * 1024)
                    if not chunk:
                        break
                    await out_file.write(chunk)
            image_url = f"/uploads/{unique_name}"
        except Exception:
            # fallback to blocking write (should rarely happen)
            file.file.seek(0)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            image_url = f"/uploads/{unique_name}"

    new_shoutout = ShoutOut(
        message=message, sender_id=current_user.id, image_url=image_url
    )
    db.add(new_shoutout)
    db.commit()
    db.refresh(new_shoutout)

    if recipient_ids_list:
        for rid in recipient_ids_list:
            try:
                rid_int = int(rid)
            except (TypeError, ValueError):
                continue
            db.add(ShoutOutRecipient(shoutout_id=new_shoutout.id, recipient_id=rid_int))
        db.commit()

    recipients = (
        db.query(User)
        .join(ShoutOutRecipient, User.id == ShoutOutRecipient.recipient_id)
        .filter(ShoutOutRecipient.shoutout_id == new_shoutout.id)
        .all()
    )
    recipient_names = [r.name for r in recipients]

    return schemas.ShoutoutResponse(
        id=new_shoutout.id,
        message=new_shoutout.message,
        sender_id=current_user.id,
        sender_name=current_user.name,
        sender_role=current_user.role,
        sender_department=current_user.department,
        created_at=new_shoutout.created_at,
        recipient_names=recipient_names,
        image_url=image_url,
    )


# ---------------- Get shoutouts (feed) ----------------
@app.get("/shoutouts", response_model=List[schemas.ShoutoutResponse])
def get_shoutouts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shoutouts = (
        db.query(ShoutOut)
        .join(User, ShoutOut.sender_id == User.id)
        .filter(User.department == current_user.department)
        .order_by(ShoutOut.created_at.desc())
        .all()
    )

    response = []
    for s in shoutouts:
        sender = db.query(User).filter(User.id == s.sender_id).first()
        recipients = (
            db.query(User)
            .join(ShoutOutRecipient, User.id == ShoutOutRecipient.recipient_id)
            .filter(ShoutOutRecipient.shoutout_id == s.id)
            .all()
        )
        recipient_names = [r.name for r in recipients]

        response.append(
            schemas.ShoutoutResponse(
                id=s.id,
                message=s.message,
                sender_id=s.sender_id,
                sender_name=(sender.name if sender else "Unknown"),
                sender_role=(sender.role if sender else "Unknown"),
                sender_department=(sender.department if sender else None),
                created_at=s.created_at,
                recipient_names=recipient_names,
                image_url=s.image_url,
            )
        )
    return response


# ---------------- Dashboard & Others (unchanged) ----------------
# ---------------- Dashboard stats ----------------
@app.get("/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()

    print("🟡 Logged in user:", current_user.id, current_user.name, current_user.department)

    my_total_shoutouts = (
        db.query(ShoutOut)
        .filter(ShoutOut.sender_id == current_user.id)
        .count()
    )

    my_today_shoutouts = (
        db.query(ShoutOut)
        .filter(
            ShoutOut.sender_id == current_user.id,
            func.date(ShoutOut.created_at) == today
        )
        .count()
    )

    team_today_shoutouts = (
        db.query(ShoutOut)
        .join(User, ShoutOut.sender_id == User.id)
        .filter(
            User.department == current_user.department,
            ShoutOut.sender_id != current_user.id,
            func.date(ShoutOut.created_at) == today
        )
        .count()
    )

    team_members = (
    db.query(User)
    .filter(
        User.department == current_user.department,
        User.id != current_user.id
    )
    .count()
)

   

    recent_shoutouts = (
        db.query(ShoutOut)
        .join(User, ShoutOut.sender_id == User.id)
        .filter(User.department == current_user.department)
        .order_by(ShoutOut.created_at.desc())
        .limit(5)
        .all()
    )

    
    return {
    "total_shoutouts": my_total_shoutouts,
    "posts_today": my_today_shoutouts + team_today_shoutouts,
    "team_members": team_members,  # ✅ renamed field
    "recent_activity": [
        {
            "sender_name": db.query(User).filter(User.id == s.sender_id).first().name,
            "message": s.message,
            "created_at": s.created_at.isoformat(),
        }
        for s in recent_shoutouts
    ],
}



# ---------------- Update profile ----------------
def UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    password: Optional[str] = None


@app.put("/update-profile", response_model=schemas.UserResponse)
def update_profile(
    payload: UpdateProfileRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if payload.name:
            current_user.name = payload.name
        if payload.department:
            current_user.department = payload.department
        if payload.password:
            current_user.password = auth.hash_password(payload.password)

        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        print("❌ Error updating profile:", e)
        raise HTTPException(status_code=500, detail="Error updating profile")

from fastapi import Body

@app.post("/refresh", response_model=schemas.Token)
def refresh_token(
    refresh_data: dict = Body(...),
    db: Session = Depends(get_db)
):
    refresh_token = refresh_data.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token missing")

    try:
        payload = auth.decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        new_access_token = auth.create_access_token(subject=str(user.id))
        return {
            "access_token": new_access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    except Exception as e:
        print("❌ Refresh token error:", e)
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

# ---------------- Delete account ----------------
@app.delete("/delete-account")
def delete_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}
# ---------------- COMMENTS FEATURE ----------------


@app.post("/comments", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not comment.content or not comment.shoutout_id:
        raise HTTPException(status_code=400, detail="Missing comment content or shoutout_id")

    shoutout = db.query(ShoutOut).filter(ShoutOut.id == comment.shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="ShoutOut not found")

    new_comment = Comment(
        content=comment.content,
        user_id=current_user.id,
        shoutout_id=comment.shoutout_id,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return CommentResponse(
        id=new_comment.id,
        shoutout_id=comment.shoutout_id,
        content=new_comment.content,
        user_id=current_user.id,
        user_name=current_user.name,
        created_at=new_comment.created_at,
    )


@app.get("/comments/{shoutout_id}", response_model=List[CommentResponse])
def get_comments(shoutout_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment)
        .join(User, Comment.user_id == User.id)
        .filter(Comment.shoutout_id == shoutout_id)
        .order_by(Comment.created_at.asc())
        .all()
    )

    return [
        CommentResponse(
            id=c.id,
            shoutout_id=shoutout_id,
            content=c.content,
            user_id=c.user_id,
            user_name=c.user.name,
            created_at=c.created_at,
        )
        for c in comments
    ]
