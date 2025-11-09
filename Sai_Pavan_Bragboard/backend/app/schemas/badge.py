# In: backend/app/schemas/badge.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BadgeOut(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    awarded_at: Optional[datetime] = None

    class Config:
        from_attributes = True
