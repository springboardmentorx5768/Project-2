# In: backend/app/models/attachment.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Attachment(Base):
    __tablename__ = 'attachments'
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)  # Original filename
    unique_filename = Column(String, nullable=False)  # UUID-based filename
    file_path = Column(String, nullable=False)  # Relative path to file
    file_url = Column(String, nullable=False)  # URL to access file
    file_type = Column(String, nullable=False)  # 'image', 'pdf', 'document'
    file_size = Column(Integer, nullable=False)  # File size in bytes
    mime_type = Column(String, nullable=True)  # MIME type
    
    # Foreign key to shoutout
    shoutout_id = Column(Integer, ForeignKey('shoutouts.id'), nullable=False)
    
    # Foreign key to uploader
    uploaded_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    shoutout = relationship("Shoutout", back_populates="attachments")
    uploader = relationship("User")