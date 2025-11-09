from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    department = Column(String, nullable=True)
    role = Column(String, default="employee", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    shoutouts_sent = relationship("ShoutOut", back_populates="sender", cascade="all, delete-orphan")
    received_shoutouts = relationship("ShoutOutRecipient", back_populates="recipient")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete-orphan")


class ShoutOut(Base):
    __tablename__ = "shoutouts"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    image_url = Column(String, nullable=True)  # ✅ Added field for image

    # Relationships
    sender = relationship("User", back_populates="shoutouts_sent")
    recipients = relationship("ShoutOutRecipient", back_populates="shoutout", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="shoutout", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="shoutout", cascade="all, delete-orphan")


class ShoutOutRecipient(Base):
    __tablename__ = "shoutout_recipients"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    shoutout = relationship("ShoutOut", back_populates="recipients")
    recipient = relationship("User", back_populates="received_shoutouts")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))

    # Relationships
    user = relationship("User", back_populates="comments")
    shoutout = relationship("ShoutOut", back_populates="comments")


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # e.g., "like", "clap", "star"
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="reactions")
    shoutout = relationship("ShoutOut", back_populates="reactions")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    shoutout = relationship("ShoutOut", backref="reports")
    reporter = relationship("User")
