from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ===============================
# USER SCHEMAS
# ===============================

class UserBase(BaseModel):
    name: str
    email: str
    department: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(UserBase):
    id: int
    role: str
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# ===============================
# TOKEN SCHEMA
# ===============================

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


# ===============================
# SHOUTOUT SCHEMAS
# ===============================

class ShoutoutBase(BaseModel):
    message: str
    recipient_ids: List[int] = Field(default_factory=list)
    image_url: Optional[str] = None  # ✅ Added for returning image path


class ShoutoutCreate(ShoutoutBase):
    department: Optional[str] = None


class ShoutoutResponse(ShoutoutBase):
    id: int
    sender_id: int
    sender_name: str
    sender_role: Optional[str] = None
    sender_department: Optional[str] = None
    created_at: Optional[datetime] = None
    recipient_names: List[str] = Field(default_factory=list)

    class Config:
        orm_mode = True


# ===============================
# COMMENT SCHEMAS
# ===============================

# ===============================
# COMMENT SCHEMAS
# ===============================

class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    shoutout_id: int  # ✅ include shoutout id


class CommentResponse(CommentBase):
    id: int
    shoutout_id: int
    user_id: int
    user_name: str
    created_at: datetime

    class Config:
        orm_mode = True
