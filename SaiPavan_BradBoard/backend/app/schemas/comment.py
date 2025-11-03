# In: backend/app/schemas/comment.py

from pydantic import BaseModel
from datetime import datetime
from .user import User

class CommentCreate(BaseModel):
    content: str

class Comment(BaseModel):
    id: int
    content: str
    user_id: int
    shoutout_id: int
    created_at: datetime
    user: User
    
    class Config:
        from_attributes = True