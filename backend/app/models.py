from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(10), nullable=False, default="employee")
    name = Column(String(255))  # ← This matches the DB column
    department = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # 🆕 Added for profile
    joining_date = Column(String, nullable=True)
    current_project = Column(String, nullable=True)
    group_members = Column(String, nullable=True)
    
    skills = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    bio = Column(Text, nullable=True)

    # Relationships
    shout_outs_sent = relationship("ShoutOut", foreign_keys="ShoutOut.sender_id", back_populates="sender")
    shout_outs_received = relationship("ShoutOut", foreign_keys="ShoutOut.recipient_id", back_populates="recipient")
    reactions = relationship("Reaction", back_populates="user")
    comments = relationship("Comment", back_populates="user")


class SecurityKey(Base):
    __tablename__ = "security_keys"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    is_used = Column(Boolean, default=False)


class ReactionType(str, enum.Enum):
    LIKE = "like"
    CLAP = "clap"
    STAR = "star"


class ShoutOutCategory(str, enum.Enum):
    SHOUTOUT = "shoutout"
    TIMELINE = "timeline"
    ACHIEVEMENT = "achievement"
    TEAM = "team"


class ShoutOut(Base):
    __tablename__ = "shout_outs"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    title = Column(String(255), nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    department = Column(String, nullable=True)
    category = Column(String(20), nullable=False, default=ShoutOutCategory.SHOUTOUT.value)
    event_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_reported = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="shout_outs_sent")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="shout_outs_received")
    reactions = relationship("Reaction", back_populates="shout_out", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="shout_out", cascade="all, delete-orphan")


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shout_out_id = Column(Integer, ForeignKey("shout_outs.id"), nullable=False)
    reaction_type = Column(Enum(ReactionType), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="reactions")
    shout_out = relationship("ShoutOut", back_populates="reactions")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shout_out_id = Column(Integer, ForeignKey("shout_outs.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)  # For nested comments
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="comments")
    shout_out = relationship("ShoutOut", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    shout_out_id = Column(Integer, ForeignKey("shout_outs.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, resolved, dismissed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    shout_out = relationship("ShoutOut")
    reporter = relationship("User")


class NotificationType(str, enum.Enum):
    REACTION = "reaction"
    COMMENT = "comment"
    FOLLOW = "follow"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    shout_out_id = Column(Integer, ForeignKey("shout_outs.id"), nullable=True)
    notification_type = Column(Enum(NotificationType), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="notifications")
    source_user = relationship("User", foreign_keys=[source_user_id])
    shout_out = relationship("ShoutOut")




