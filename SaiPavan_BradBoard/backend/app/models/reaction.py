# In: backend/app/models/reaction.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Reaction(Base):
    __tablename__ = 'reactions'
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # 'like', 'clap', 'star'
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    shoutout_id = Column(Integer, ForeignKey('shoutouts.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    shoutout = relationship("Shoutout")
    
    # Ensure one reaction per user per shoutout per type
    __table_args__ = (
        UniqueConstraint('user_id', 'shoutout_id', 'type', name='unique_user_shoutout_reaction'),
    )