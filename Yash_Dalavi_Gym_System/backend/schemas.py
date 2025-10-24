from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- User Schemas (We need a simple one for nesting) ---
class UserBase(BaseModel):
    email: EmailStr

class UserInDB(UserBase):
    id: int
    role: str
    class Config:
        from_attributes = True

# --- Comment Schemas ---
class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    author: UserInDB # Changed to include author details

    class Config:
        from_attributes = True

# --- Shoutout Schemas ---
class ShoutoutBase(BaseModel):
    message: str
    tagged_users: str
    file_url: Optional[str] = None

class ShoutoutCreate(ShoutoutBase):
    pass

class Shoutout(ShoutoutBase):
    id: int
    author: UserInDB # Changed to include author details
    comments: List[Comment] = []

    class Config:
        from_attributes = True

# --- Full User Schemas ---
class UserCreate(UserBase):
    password: str
    role: str | None = "member"

class BragSheetBase(BaseModel):
    name: str
    project_name: str
    countofmember: int
    skills: str
    finance: str | None = None
class BragSheetCreate(BragSheetBase):
    pass
class BragSheet(BragSheetBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True
        
class User(UserBase):
    id: int
    is_active: bool
    role: str
    brag_sheets: List[BragSheet] = []
    shoutouts_given: List[Shoutout] = []

    class Config:
        from_attributes = True