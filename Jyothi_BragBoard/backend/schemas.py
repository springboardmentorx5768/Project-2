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
    image_url: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


class DepartmentStats(BaseModel):
    department: str
    total_shoutouts: int
    shoutouts_given: int
    shoutouts_received: int

    model_config = {
        "from_attributes": True
    }
