from pydantic import BaseModel, EmailStr
from typing import Optional

# ----- Login Request -----
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str  # "admin" or "employee"

# ----- User Creation -----
class UserCreate(BaseModel):
    username: str
    name: str
    email: EmailStr
    password: str
    role: str  # "admin" or "employee"

# ----- User Output -----
class UserOut(BaseModel):
    id: int
    username: str
    name: Optional[str] = None
    email: EmailStr
    role: str

    class Config:
        orm_mode = True

# ----- Token Schemas -----
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: int  # user id
    exp: int  # expiration timestamp
