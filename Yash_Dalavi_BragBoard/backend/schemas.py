from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- User Schema for Nesting ---
class AuthorSchema(BaseModel):
    id: int
    email: EmailStr
    department: str # <-- ADDED DEPARTMENT
    class Config:
        from_attributes = True

# --- Comment Schemas ---
class CommentBase(BaseModel):
    text: str
class CommentCreate(CommentBase):
    pass
class Comment(CommentBase):
    id: int
    author: AuthorSchema
    class Config:
        from_attributes = True

# --- NEW: Reaction Schemas (For Week 5) ---
class ReactionBase(BaseModel):
    reaction_type: str

class ReactionCreate(ReactionBase):
    pass

class Reaction(ReactionBase):
    id: int
    owner_id: int
    shoutout_id: int

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
    author: AuthorSchema
    comments: List[Comment] = []
    
    # --- UPDATED FOR WEEK 5 ---
    # These lines are new. They will hold the reaction data
    reaction_counts: dict[str, int] = {}
    current_user_reaction: Optional[str] = None
    # --------------------------
    
    class Config:
        from_attributes = True

# --- BragSheet Schemas ---
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
        
# --- Full User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
class UserCreate(UserBase):
    password: str
    role: str | None = "member"
    department: str | None = "general" # <-- ADDED DEPARTMENT
class User(UserBase):
    id: int
    is_active: bool
    role: str
    department: str # <-- ADDED DEPARTMENT
    brag_sheets: List[BragSheet] = []
    shoutouts_given: List[Shoutout] = []
    comments_made: List[Comment] = []
    class Config:
        from_attributes = True