from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    employee = "employee"
    manager = "manager" 
    admin = "admin"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    department_id: Optional[int] = None
    role: UserRole = UserRole.employee
    bio: Optional[str] = None
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot be longer than 72 bytes')
        if len(v) < 1:
            raise ValueError('Password cannot be empty')
        return v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    role: Optional[UserRole] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: Optional[bool] = None

class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password_length(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot be longer than 72 bytes')
        if len(v) < 1:
            raise ValueError('Password cannot be empty')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot be longer than 72 bytes')
        return v

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    joined_at: datetime
    last_login: Optional[datetime] = None

class UserWithDepartment(UserResponse):
    department_name: Optional[str] = None
    achievement_count: Optional[int] = 0
    total_points: Optional[int] = 0

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None