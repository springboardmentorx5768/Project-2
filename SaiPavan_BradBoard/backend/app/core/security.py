from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.core.config import settings

# Use pbkdf2_sha256 (pure-Python) as the scheme for password hashing to avoid
# system-level bcrypt compatibility issues in some local environments. This is
# safe for development; for production you may prefer bcrypt/argon2 and ensure
# the runtime has the required native libs installed.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    # bcrypt has a maximum password length of 72 bytes. Truncate the incoming
    # password to 72 bytes (utf-8) before verification to avoid errors when
    # clients send longer passwords.
    try:
        b = plain_password.encode('utf-8')
        if len(b) > 72:
            # truncate and decode safely
            truncated = b[:72].decode('utf-8', errors='ignore')
        else:
            truncated = plain_password
    except Exception:
        truncated = plain_password
    return pwd_context.verify(truncated, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a password for storing."""
    # bcrypt has a maximum password length of 72 bytes. Truncate the password
    # to 72 bytes (utf-8) before hashing to avoid raising errors in the
    # hashing backend. Log a warning in development if truncation occurred.
    try:
        b = password.encode('utf-8')
        if len(b) > 72:
            # truncate bytes and decode safely
            truncated = b[:72].decode('utf-8', errors='ignore')
            # lightweight logging without importing logging at top-level
            try:
                import logging
                logging.warning('Password longer than 72 bytes; truncating before hashing')
            except Exception:
                pass
            return pwd_context.hash(truncated)
        else:
            return pwd_context.hash(password)
    except Exception:
        # Fallback to hashing whatever was provided if unexpected encoding error
        return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Creates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
