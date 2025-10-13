from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.user import AchievementType

class AchievementBase(BaseModel):
    title: str
    description: str
    achievement_type: AchievementType
    points: Optional[int] = 0
    is_featured: Optional[bool] = False

class AchievementCreate(AchievementBase):
    user_id: int
    department_id: int

class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    achievement_type: Optional[AchievementType] = None
    points: Optional[int] = None
    is_featured: Optional[bool] = None

class Achievement(AchievementBase):
    id: int
    user_id: int
    department_id: int
    achieved_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class AchievementWithUser(Achievement):
    user_name: str
    user_email: str
    department_name: str