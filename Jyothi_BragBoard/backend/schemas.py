from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

# ===== Enums =====
class CategoryEnum(str, Enum):
    teamwork = "teamwork"
    innovation = "innovation"
    leadership = "leadership"
    customer_service = "customer_service"
    problem_solving = "problem_solving"
    mentorship = "mentorship"


class VisibilityEnum(str, Enum):
    public = "public"
    private = "private"
    department_only = "department_only"


# ===== User Schemas =====
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    department: str
    role: str = "employee"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    username: str
    email: EmailStr
    department: str
    role: str
    joined_at: datetime

    model_config = {
        "from_attributes": True
    }


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    department: str
    role: str

    model_config = {
        "from_attributes": True
    }
    
class UserUpdate(BaseModel):
    username: Optional[str]
    email: Optional[EmailStr]
    department: Optional[str]
    role: Optional[str]

# ===== Reaction Schemas =====
class ReactionBase(BaseModel):
    reaction_type: str   # like, love, clap, celebrate, etc.


class ReactionResponse(BaseModel):
    id: int
    user_id: int
    username: str
    reaction_type: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class AddReactionRequest(BaseModel):
    reaction_type: str

class ReactionCountResponse(BaseModel):
    like: int = 0
    love: int = 0
    clap: int = 0
    celebrate: int = 0
    insightful: int = 0
    support: int = 0
    star: int = 0
    my_reaction: Optional[str] = None

# ===== ShoutOut Schemas =====
class ShoutOutCreate(BaseModel):
    title: str
    message: str
    receiver_id: int
    tagged_user_ids: Optional[List[int]] = []
    category: CategoryEnum
    is_public: VisibilityEnum = VisibilityEnum.public
    image_url: Optional[str] = None  # Optional for image


class ShoutOutResponse(BaseModel):
    id: int
    giver_id: int          
    receiver_id: int 
    title: str
    message: str
    giver_name: str
    receiver_name: str
    giver_department: str
    receiver_department: str
    giver_role: Optional[str]
    receiver_role: Optional[str]        
    tagged_users: List[UserOut] = []
    category: CategoryEnum
    is_public: VisibilityEnum
    created_at: datetime
    edited_at: Optional[datetime] = None
    image_url: Optional[str] = None
    reactions: List[ReactionResponse] = []

    model_config = {
        "from_attributes": True
    }

class ShoutOutUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_public: Optional[str] = None  # "public", "department_only", "private"
    tagged_user_ids: Optional[List[int]] = None  

class DepartmentStats(BaseModel):
    department: str
    total_shoutouts: int
    shoutouts_given: int
    shoutouts_received: int

    model_config = {
        "from_attributes": True
    }

