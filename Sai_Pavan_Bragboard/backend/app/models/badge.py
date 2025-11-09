# In: backend/app/models/badge.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Badge(Base):
    __tablename__ = 'badges'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), index=True, nullable=False)
    code = Column(String, nullable=False)  # e.g., APPRECIATION_CHAMP
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User')

    __table_args__ = (
        UniqueConstraint('user_id', 'code', name='uq_user_badge_code'),
    )
