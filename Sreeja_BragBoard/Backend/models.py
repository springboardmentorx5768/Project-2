from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    department = Column(String, nullable=False)
    role = Column(Enum("employee", "admin", name="user_role"), default="employee")
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    given_shoutouts = relationship("ShoutOut", foreign_keys="ShoutOut.giver_id", back_populates="giver")
    received_shoutouts = relationship("ShoutOut", foreign_keys="ShoutOut.receiver_id", back_populates="receiver")
    activities = relationship("ActivityLog", back_populates="user")

class ShoutOut(Base):
    __tablename__ = "shoutouts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    giver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    giver_department = Column(String, nullable=False)  # Department of person giving shoutout
    receiver_department = Column(String, nullable=False)  # Department of person receiving shoutout
    category = Column(Enum("teamwork", "innovation", "leadership", "customer_service", "problem_solving", "mentorship", name="shoutout_category"), nullable=False)
    is_public = Column(Enum("public", "department_only", "private", name="visibility_level"), default="public")
    created_at = Column(DateTime, default=datetime.utcnow)
    image_url = Column(String, nullable=True)  # Store the URL of uploaded images
    
    # Relationships
    giver = relationship("User", foreign_keys=[giver_id], back_populates="given_shoutouts")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_shoutouts")
    reactions = relationship("Reaction", back_populates="shoutout", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="shoutout", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    shoutout = relationship("ShoutOut", back_populates="comments")
    user = relationship("User")

class Reaction(Base):
    __tablename__ = "reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reaction_type = Column(Enum("like", "clap", "star", name="reaction_type"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    shoutout = relationship("ShoutOut", back_populates="reactions")
    user = relationship("User")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action_type = Column(String, nullable=False)  # e.g., 'shoutout_created', 'user_registered', 'user_deleted'
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="activities")

