# In: backend/app/schemas/reaction.py

from pydantic import BaseModel
from datetime import datetime
from typing import Literal, Optional
from .user import User

class ReactionCreate(BaseModel):
    type: Literal['like', 'clap', 'star']

class Reaction(BaseModel):
    id: int
    type: str
    user_id: int
    shoutout_id: int
    created_at: datetime
    # Include user information when fetching reactions
    user: Optional[User] = None
    
    class Config:
        from_attributes = True