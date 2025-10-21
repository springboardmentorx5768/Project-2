from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime
from .user import User  # Import the User schema

# Properties to receive via API on creation
class ShoutoutCreate(BaseModel):
    message: str
    recipient_ids: List[int] | None = None
    # If is_all is true the shoutout will be sent to all users
    is_all: bool | None = False
    # Optionally target a single department by name (e.g., "Engineering")
    department: str | None = None

# Properties to return to client
class Shoutout(BaseModel):
    id: int
    message: str
    created_at: datetime
    sender: User
    recipients: List[User]

    # Placeholder fields to match frontend expectations
    reactions: Dict[str, int] = {'like': 0, 'clap': 0, 'star': 0}
    comment_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)
