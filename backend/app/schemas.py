from pydantic import BaseModel, EmailStr, Field
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
    bio: Optional[str] = None     
    
    class Config:
        from_attributes = True


# ----- Token Schemas -----
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: int  # user id
    exp: int  # expiration timestamp

class UpdateProfile(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    joining_date: Optional[str] = None
    current_project: Optional[str] = None
    group_members: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


# ----- ShoutOut Schemas -----
class ShoutOutCreate(BaseModel):
    title: Optional[str] = None
    content: str
    recipient_id: Optional[int] = None
    image_url: Optional[str] = None
    category: str = "shoutout"
    department: Optional[str] = None
    event_date: Optional[str] = None  # ISO formatted string


class ShoutOutOut(BaseModel):
    id: int
    title: Optional[str] = None
    content: str
    image_url: Optional[str] = None
    sender_id: int
    recipient_id: Optional[int] = None
    department: Optional[str] = None
    category: str
    event_date: Optional[datetime] = None
    created_at: datetime
    sender: Optional[UserOut] = None
    recipient: Optional[UserOut] = None
    reaction_counts: Optional[dict] = None
    user_reactions: Optional[List[str]] = None
    comment_count: Optional[int] = 0

    class Config:
        from_attributes = True


class TimelinePostCreate(BaseModel):
    content: str
    title: Optional[str] = None


class AchievementCreate(BaseModel):
    title: str
    description: str
    achieved_at: Optional[str] = None  # ISO formatted string


# ----- Reaction Schemas -----
class ReactionCreate(BaseModel):
    shout_out_id: int
    reaction_type: str  # "like", "clap", "star"


class ReactionOut(BaseModel):
    id: int
    user_id: int
    shout_out_id: int
    reaction_type: str
    created_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


# ----- Comment Schemas -----
class CommentCreate(BaseModel):
    content: str
    shout_out_id: int
    parent_id: Optional[int] = None


class CommentOut(BaseModel):
    id: int
    content: str
    user_id: int
    shout_out_id: int
    parent_id: Optional[int] = None
    created_at: datetime
    user: Optional[UserOut] = None
    replies: Optional[List["CommentOut"]] = []

    class Config:
        from_attributes = True


# ----- Report Schemas -----
class ReportCreate(BaseModel):
    shout_out_id: int
    reason: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    shout_out_id: int
    reporter_id: int
    reason: Optional[str] = None
    status: str
    created_at: datetime
    shout_out: Optional[ShoutOutOut] = None
    reporter: Optional[UserOut] = None

    class Config:
        from_attributes = True


# ----- Admin Analytics Schemas -----
class AnalyticsOut(BaseModel):
    total_shout_outs: int
    total_users: int
    total_reactions: int
    total_comments: int
    top_contributors: List[dict]
    most_tagged: List[dict]
    department_stats: List[dict]


class LeaderboardEntry(BaseModel):
    user_id: int
    user_name: str
    department: str
    shout_outs_received: int
    reactions_received: int
    total_score: int


# ----- Notification Schemas -----
class NotificationOut(BaseModel):
    id: int
    notification_type: str
    message: str
    is_read: bool
    created_at: datetime
    shout_out_id: Optional[int] = None
    source_user: Optional[UserOut] = None

    class Config:
        from_attributes = True


class NotificationReadUpdate(BaseModel):
    notification_ids: List[int]


class ShoutOutSummary(BaseModel):
    achievements_count: int
    shoutouts_sent_count: int
    shoutouts_received_count: int
    recent_shoutouts: List[ShoutOutOut] = Field(default_factory=list)