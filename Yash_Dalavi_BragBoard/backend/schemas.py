from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- User Schema for Nesting ---
class AuthorSchema(BaseModel):
    id: int
    email: EmailStr
    department: str
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
    created_at: datetime 
    class Config:
        from_attributes = True

# --- Reaction Schemas ---
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
    created_at: datetime 
    reaction_counts: dict[str, int] = {}
    current_user_reaction: Optional[str] = None
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
    department: str | None = "general"
class User(UserBase):
    id: int
    is_active: bool
    role: str
    department: str
    brag_sheets: List[BragSheet] = []
    shoutouts_given: List[Shoutout] = []
    comments_made: List[Comment] = []
    class Config:
        from_attributes = True

# --- Admin Stats Schemas ---
class ContributorStat(BaseModel):
    email: str
    count: int
    class Config:
        from_attributes = True

class AdminStats(BaseModel):
    total_shoutouts: int
    total_members: int
    top_contributors: List[ContributorStat]
    class Config:
        from_attributes = True

# --- Report Schemas ---
class ReportBase(BaseModel):
    reason: Optional[str] = None
class ReportCreate(ReportBase):
    pass
class Report(ReportBase):
    id: int
    shoutout_id: int
    reported_by_id: int
    status: str
    class Config:
        from_attributes = True

# --- YEH NAYE SCHEMAS ADD HUYE HAIN (WEEK 6 - REPORT DETAILS) ---

# Admin ko dikhane ke liye chhota Shoutout schema
class ShoutoutDetailsForReport(BaseModel):
    id: int
    message: str
    class Config:
        from_attributes = True

# Admin ko dikhane ke liye chhota User (reporter) schema
class ReporterDetails(BaseModel):
    id: int
    email: str
    class Config:
        from_attributes = True

# Poora Report Details schema (jo data frontend par bhejenge)
class ReportDetails(BaseModel):
    id: int
    reason: Optional[str]
    status: str
    shoutout: ShoutoutDetailsForReport # Nested shoutout
    reporter: ReporterDetails # Nested user
    
    class Config:
        from_attributes = True