from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    department: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

class UserSettingsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    weekly_digest: Optional[bool] = None
    public_profile: Optional[bool] = None
    show_email: Optional[bool] = None
    show_phone: Optional[bool] = None
    theme: Optional[str] = None
    language: Optional[str] = None

class UserSettings(BaseModel):
    email_notifications: bool
    push_notifications: bool
    weekly_digest: bool
    public_profile: bool
    show_email: bool
    show_phone: bool
    theme: str
    language: str

    model_config = ConfigDict(from_attributes=True)

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    is_approved: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserOut(User):
    pass
