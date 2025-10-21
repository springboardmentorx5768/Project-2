# In: backend/app/models/shoutout.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
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
    
    sender = relationship(
        "User", 
        back_populates="shoutouts_sent"
    )
    recipients = relationship(
        "User",
        secondary=shoutout_recipients,
        back_populates="shoutouts_received"
    )