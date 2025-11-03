# In: backend/app/models/user.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)

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