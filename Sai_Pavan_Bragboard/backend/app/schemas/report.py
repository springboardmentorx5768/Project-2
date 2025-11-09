from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    reason: Optional[str] = None

class ReportOut(BaseModel):
    id: int
    shoutout_id: int
    reporter_id: int
    reason: Optional[str]
    status: str
    created_at: Optional[datetime]
    resolved_at: Optional[datetime]
    resolved_by: Optional[int]

    class Config:
        from_attributes = True  # Pydantic v2 replacement for orm_mode