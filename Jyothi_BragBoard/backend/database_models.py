from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, UniqueConstraint
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
    
    @property
    def is_admin(self):
        return self.role == "admin"
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
    reactions = relationship(
        "ShoutOutReaction", 
        back_populates="user", 
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
    is_deleted = Column(Boolean, default=False)

    # Relationships
    giver = relationship("User", foreign_keys=[giver_id], back_populates="given_shoutouts")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_shoutouts")
    tags = relationship("ShoutOutTag", back_populates="shoutout", cascade="all, delete-orphan", lazy="joined")
    reactions = relationship("ShoutOutReaction", back_populates="shoutout", cascade="all, delete-orphan")


class ShoutOutTag(Base):
    __tablename__ = "shoutout_tags"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id", ondelete="CASCADE"), nullable=False)
    tagged_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    shoutout = relationship("ShoutOut", back_populates="tags")
    tagged_user = relationship("User")

class ShoutOutReaction(Base):
    __tablename__ = "shoutout_reactions"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reaction_type = Column(String, nullable=False)  # "like", "love", "clap", etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    shoutout = relationship("ShoutOut", back_populates="reactions")
    user = relationship("User", back_populates="reactions")

    __table_args__ = (
    UniqueConstraint("shoutout_id", "user_id", name="unique_user_shoutout_reaction"),
    )

class ShoutOutReport(Base):
    __tablename__ = "shoutout_reports"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id", ondelete="CASCADE"), index=True, nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending / resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=None)
    action_taken_by = Column(Integer, ForeignKey("users.id"), nullable=True)  
    
    # Relationships
    reporter = relationship(
        "User",
        foreign_keys=[reporter_id],
        backref="reports_made"
    )

    admin = relationship(
        "User",
        foreign_keys=[action_taken_by],
        backref="reports_handled"
    )

    shoutout = relationship("ShoutOut", backref="reports")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    edited_at = Column(DateTime, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", backref="comments")
    shoutout = relationship("ShoutOut", backref="comments")

