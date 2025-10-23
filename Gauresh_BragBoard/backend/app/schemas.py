from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

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
    department: str
    security_key: Optional[str] = None  # only needed for admin registration

# ----- User Output -----
class UserOut(BaseModel):
    id: int
    username: str
    name: Optional[str] = None
    email: EmailStr
    role: str
    department: str | None = None
    is_active: Optional[bool] = True 
    joining_date: Optional[str] = None
    current_project: Optional[str] = None
    group_members: Optional[str] = None  # <-- optional, default True
    
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

class UpdateProfile(BaseModel):
    joining_date: Optional[str] = None
    current_project: Optional[str] = None
    group_members: Optional[str] = None


# ----- ShoutOut Schemas -----
class ShoutOutOut(BaseModel):
    id: int
    author_id: int
    author_name: str  # ✅ include name here
    message: str
    image_url: Optional[str] = None
    created_at: Optional[str] = None
    tagged_users: List[int] = []
    tagged_user_names: List[str] = []
    reactions: dict = {}
    comments_count: int = 0

    class Config:
        from_attributes = True


class ShoutOutCommentOut(BaseModel):
    id: int
    content: str
    created_at: Optional[str] = None
    user_id: int

    class Config:
        from_attributes = True


class MetricsOut(BaseModel):
    shoutouts_given: int
    shoutouts_received: int
    comments_made: int
    recent: List[dict]


class ReactionIn(BaseModel):
    emoji: str


class CommentIn(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: int
    content: str
    created_at: Optional[str] = None
    user_id: int

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str