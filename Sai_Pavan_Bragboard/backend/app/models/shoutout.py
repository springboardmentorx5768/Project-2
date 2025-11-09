# In: backend/app/models/shoutout.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

# Association Table for Many-to-Many recipients
shoutout_recipients = Table(
    'shoutout_recipients',
    Base.metadata,
    Column('shoutout_id', Integer, ForeignKey('shoutouts.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class Shoutout(Base):
    __tablename__ = 'shoutouts'
    
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Visibility scope fields
    is_all = Column(Boolean, default=False)  # True if visible to all users
    target_department = Column(String, nullable=True)  # Department name if department-specific
    
    # File attachment fields
    attachment_url = Column(String, nullable=True)  # URL/path to the uploaded file
    attachment_filename = Column(String, nullable=True)  # Original filename
    attachment_type = Column(String, nullable=True)  # File type (image, pdf, etc.)
    attachment_size = Column(Integer, nullable=True)  # File size in bytes
    
    sender = relationship(
        "User", 
        back_populates="shoutouts_sent"
    )
    recipients = relationship(
        "User",
        secondary=shoutout_recipients,
        back_populates="shoutouts_received"
    )
    reactions = relationship(
        "Reaction",
        back_populates="shoutout",
        cascade="all, delete-orphan"
    )
    comments = relationship(
        "Comment",
        back_populates="shoutout",
        cascade="all, delete-orphan"
    )
    attachments = relationship(
        "Attachment",
        back_populates="shoutout",
        cascade="all, delete-orphan"
    )
    