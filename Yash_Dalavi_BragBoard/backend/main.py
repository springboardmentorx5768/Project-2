from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import shutil
from fastapi.staticfiles import StaticFiles

import models, schemas, crud
from database import engine, SessionLocal

# --- SECURITY SETUP ---
SECRET_KEY = "your-super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
security = HTTPBearer()

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HELPER FUNCTIONS ---
# (get_db, get_current_user, create_access_token remain the same)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = creds.credentials
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=email)
    if user is None: raise credentials_exception
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta: expire = datetime.utcnow() + expires_delta
    else: expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- API ENDPOINTS ---
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user: raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user
            
@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

# (Brag Sheet endpoints remain the same)
@app.post("/bragsheets/", response_model=schemas.BragSheet)
def create_brag_sheet_for_user(brag_sheet: schemas.BragSheetCreate, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_user_brag_sheet(db=db, brag_sheet=brag_sheet, user_id=current_user.id)
@app.get("/bragsheets/", response_model=List[schemas.BragSheet])
def read_user_brag_sheets(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        return crud.get_all_brag_sheets(db=db)
    return crud.get_user_brag_sheets(db=db, user_id=current_user.id)
            
# --- SHOUTOUT & COMMENT & UPLOAD ENDPOINTS ---
@app.post("/shoutouts/", response_model=schemas.Shoutout)
def create_shoutout(shoutout: schemas.ShoutoutCreate, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_shoutout(db=db, shoutout=shoutout, author_id=current_user.id)

# --- UPDATED read_shoutouts ENDPOINT (FOR WEEK 5) ---
@app.get("/shoutouts/", response_model=List[schemas.Shoutout])
def read_shoutouts(
    skip: int = 0, limit: int = 100,
    department: Optional[str] = None, 
    sender_email: Optional[str] = None, 
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # YEH LINE UPDATE HO GAYI HAI
    shoutouts = crud.get_shoutouts(
        db=db, 
        current_user_id=current_user.id, # <-- YEH IMPORTANT CHANGE HAI
        skip=skip, 
        limit=limit, 
        department=department, 
        sender_email=sender_email
    )
    return shoutouts

@app.post("/shoutouts/{shoutout_id}/comments/", response_model=schemas.Comment)
def create_comment_on_shoutout(shoutout_id: int, comment: schemas.CommentCreate, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_comment(db=db, comment=comment, shoutout_id=shoutout_id, author_id=current_user.id)

# --- YEH NAYA ENDPOINT ADD HO GAYA HAI (FOR WEEK 5) ---
@app.post("/shoutouts/{shoutout_id}/react", status_code=status.HTTP_201_CREATED)
def handle_reaction(
    shoutout_id: int, 
    reaction: schemas.ReactionCreate,
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(get_current_user)
):
    return crud.manage_reaction(
        db=db, 
        shoutout_id=shoutout_id, 
        user_id=current_user.id, 
        reaction_type=reaction.reaction_type
    )

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    import os
    os.makedirs("uploads", exist_ok=True) 
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "url": f"/{file_path}"}

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI Backend!"}