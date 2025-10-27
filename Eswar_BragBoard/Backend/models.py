from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, UniqueConstraint
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
    shoutout_recipient_links = relationship("ShoutOutRecipient", back_populates="recipient")
    reactions = relationship("ShoutOutReaction", back_populates="user")

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
    image_url = Column(String, nullable=True)  # URL to attached image
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    giver = relationship("User", foreign_keys=[giver_id], back_populates="given_shoutouts")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_shoutouts")
    recipients = relationship("ShoutOutRecipient", back_populates="shoutout", cascade="all, delete-orphan")
    reactions = relationship("ShoutOutReaction", back_populates="shoutout", cascade="all, delete-orphan")

class ShoutOutRecipient(Base):
    __tablename__ = "shoutout_recipients"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    shoutout = relationship("ShoutOut", back_populates="recipients")
    recipient = relationship("User", back_populates="shoutout_recipient_links")

class ShoutOutReaction(Base):
    __tablename__ = "shoutout_reactions"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reaction_type = Column(String, nullable=False)  # e.g., 'thumbs_up', 'heart', 'clap', 'celebrate'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    shoutout = relationship("ShoutOut", back_populates="reactions")
    user = relationship("User", back_populates="reactions")

    # Ensure one reaction per user per shoutout (users can only have one reaction per shoutout)
    __table_args__ = (
        UniqueConstraint('shoutout_id', 'user_id', name='unique_user_shoutout_reaction'),
    )

