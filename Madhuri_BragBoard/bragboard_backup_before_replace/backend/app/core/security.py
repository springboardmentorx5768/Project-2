import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import hashlib
import secrets

load_dotenv()

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login/token")

# Try to initialize bcrypt, fall back to pbkdf2 if there are issues
try:
    pwd_context = CryptContext(
        schemes=["bcrypt"], 
        deprecated="auto",
        bcrypt__rounds=12
    )
    # Test bcrypt functionality
    pwd_context.hash("test")
    HASH_METHOD = "bcrypt"
except Exception as e:
    print(f"bcrypt initialization failed: {e}")
    print("Falling back to pbkdf2_sha256")
    pwd_context = CryptContext(
        schemes=["pbkdf2_sha256"], 
        deprecated="auto",
        pbkdf2_sha256__rounds=29000
    )
    HASH_METHOD = "pbkdf2"

def _truncate_password(password: str) -> str:
    """Safely truncate password for compatibility."""
    if HASH_METHOD == "bcrypt":
        # bcrypt has a 72-byte limit
        password_bytes = password.encode('utf-8')
        if len(password_bytes) <= 72:
            return password
        
        # Truncate to 72 bytes
        truncated_bytes = password_bytes[:72]
        
        # Try to decode back to string, handling potential broken UTF-8 characters
        try:
            return truncated_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If we broke a multi-byte character, try progressively shorter lengths
            for i in range(71, 60, -1):  # Try from 71 down to 60 bytes
                try:
                    return password_bytes[:i].decode('utf-8')
                except UnicodeDecodeError:
                    continue
            # If all else fails, just use the first 60 characters
            return password[:60]
    else:
        # pbkdf2 doesn't have the same length limitations
        return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    # Ensure password is within bcrypt's 72-byte limit
    safe_password = _truncate_password(plain_password)
    return pwd_context.verify(safe_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    # Ensure password is within bcrypt's 72-byte limit
    safe_password = _truncate_password(password)
    return pwd_context.hash(safe_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token."""
    from app.crud.user import get_user_by_email
    from app.core.database import get_db
    from sqlalchemy.orm import Session
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # We need to get a db session here
    # This is a dependency injection pattern
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        user = get_user_by_email(db, email=email)
        if user is None:
            raise credentials_exception
        return user
    finally:
        db.close()