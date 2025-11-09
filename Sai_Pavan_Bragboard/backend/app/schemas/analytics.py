# In: backend/app/schemas/analytics.py

from pydantic import BaseModel
from typing import List, Optional

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    name: str
    sent: int
    received: int
    score: Optional[int] = None

class DepartmentHighlight(BaseModel):
    department: str
    count: int

class AdminInsights(BaseModel):
    total_posts: int
    total_users: int
    top_tagged_users: List[str]