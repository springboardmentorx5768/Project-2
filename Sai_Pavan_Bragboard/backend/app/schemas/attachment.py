# In: backend/app/schemas/attachment.py

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class AttachmentBase(BaseModel):
    filename: str
    file_type: str
    file_size: int
    mime_type: Optional[str] = None

class AttachmentCreate(AttachmentBase):
    unique_filename: str
    file_path: str
    file_url: str

class Attachment(AttachmentBase):
    id: int
    unique_filename: str
    file_path: str
    file_url: str
    shoutout_id: int
    uploaded_by: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AttachmentOut(BaseModel):
    id: int
    filename: str
    file_url: str
    file_type: str
    file_size: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)