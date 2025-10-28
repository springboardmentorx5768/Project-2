from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    department = Column(String, nullable=True)
    role = Column(Enum("employee", "admin", name="user_role"), default="employee") 
    is_active = Column(Boolean, default=True)
    joined_at = Column(DateTime, default=datetime.utcnow)  

    # Cascade delete given and received shoutouts
    given_shoutouts = relationship(
        "ShoutOut",
        foreign_keys="ShoutOut.giver_id",
        back_populates="giver",
        cascade="all, delete-orphan"
    )
    received_shoutouts = relationship(
        "ShoutOut",
        foreign_keys="ShoutOut.receiver_id",
        back_populates="receiver",
        cascade="all, delete-orphan"
    )


class ShoutOut(Base):
    __tablename__ = "shoutouts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    giver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    giver_department = Column(String, nullable=False)  
    receiver_department = Column(String, nullable=False)
    category = Column(Enum("teamwork", "innovation", "leadership", "customer_service", "problem_solving", "mentorship", name="shoutout_category"), nullable=False)
    is_public = Column(Enum("public", "department_only", "private", name="visibility_level"), default="public")
    created_at = Column(DateTime, default=datetime.utcnow)
    image_url = Column(String, nullable=True)   
    edited_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)

    # Relationships
    giver = relationship("User", foreign_keys=[giver_id], back_populates="given_shoutouts")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_shoutouts")
    tags = relationship("ShoutOutTag", back_populates="shoutout", cascade="all, delete-orphan", lazy="joined")


class ShoutOutTag(Base):
    __tablename__ = "shoutout_tags"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id", ondelete="CASCADE"), nullable=False)
    tagged_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    shoutout = relationship("ShoutOut", back_populates="tags")
    tagged_user = relationship("User")
