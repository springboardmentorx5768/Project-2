# In: backend/app/models/user_score.py

from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class UserScore(Base):
    __tablename__ = 'user_scores'

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True, index=True)
    total_points = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship('User')
