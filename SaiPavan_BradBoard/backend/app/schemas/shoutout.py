from pydantic import BaseModel, ConfigDict, field_serializer
from typing import List, Optional, Dict
from datetime import datetime, timezone
from .user import User  # Import the User schema
from .reaction import Reaction
from .comment import Comment

# Properties to receive via API on creation
class ShoutoutCreate(BaseModel):
    message: str
    recipient_ids: List[int] | None = None
    # If is_all is true the shoutout will be sent to all users
    is_all: bool | None = False
    # Optionally target a single department by name (e.g., "Engineering")
    target_department: str | None = None
    # File attachment fields
    attachment_url: str | None = None
    attachment_filename: str | None = None
    attachment_type: str | None = None
    attachment_size: int | None = None

# Properties to return to client
class Shoutout(BaseModel):
    id: int
    message: str
    created_at: datetime
    sender: User
    recipients: List[User]

    # Visibility control fields
    is_all: bool | None = True
    target_department: str | None = None

    # File attachment fields
    attachment_url: str | None = None
    attachment_filename: str | None = None
    attachment_type: str | None = None
    attachment_size: int | None = None

    # Reactions and comments relationships
    reactions: List[Reaction] = []
    comments: List[Comment] = []
    
    @field_serializer('created_at')
    def serialize_created_at(self, dt: datetime) -> str:
        """Ensure datetime is serialized with UTC timezone information"""
        if dt.tzinfo is None:
            # Assume naive datetime is UTC (since backend uses utcnow())
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    
    model_config = ConfigDict(from_attributes=True)
