# In: backend/app/schemas/analytics.py

from pydantic import BaseModel
from typing import List

class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    sent: int
    received: int

class DepartmentHighlight(BaseModel):
    department: str
    count: int

class AdminInsights(BaseModel):
    total_posts: int
    total_users: int
    top_tagged_users: List[str]