# In: backend/app/models/user.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, index=True, nullable=True)
    bio = Column(String, nullable=True)
    location = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    # New: approval gate – users cannot log in until approved by an admin
    is_approved = Column(Boolean(), default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Settings fields
    email_notifications = Column(Boolean(), default=True)
    push_notifications = Column(Boolean(), default=False)
    weekly_digest = Column(Boolean(), default=True)
    public_profile = Column(Boolean(), default=True)
    show_email = Column(Boolean(), default=False)
    show_phone = Column(Boolean(), default=False)
    theme = Column(String, default='light')
    language = Column(String, default='en')

    # Relationships
    shoutouts_sent = relationship(
        "Shoutout",
        back_populates="sender",
        foreign_keys="[Shoutout.sender_id]"
    )
    shoutouts_received = relationship(
        "Shoutout",
        secondary="shoutout_recipients",
        back_populates="recipients"
    )
    comments = relationship("Comment", back_populates="user")
    reactions = relationship("Reaction", back_populates="user")