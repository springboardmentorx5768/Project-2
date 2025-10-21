from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import enum # 1. Import the enum module

# 2. Define UserRole as a standard Python Enum
class UserRole(str, enum.Enum):
    employee = "employee"
    admin = "admin"

# Schema for receiving user registration data
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: Optional[str] = None

# Schema for returning user data to the client (without the password)
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: Optional[str]
    role: UserRole # 3. Use the UserRole Enum as the type
    joined_at: datetime

    class Config:
        from_attributes = True