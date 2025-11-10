from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Text, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func 
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default='member')
    department = Column(String, default='general')
    
    brag_sheets = relationship("BragSheet", back_populates="owner")
    shoutouts_given = relationship("Shoutout", back_populates="author")
    comments_made = relationship("Comment", back_populates="author")

class BragSheet(Base):
    __tablename__ = "brag_sheets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    project_name = Column(String, index=True)
    countofmember = Column(Integer)
    skills = Column(String)
    finance = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="brag_sheets")

class Shoutout(Base):
    __tablename__ = "shoutouts"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    tagged_users = Column(String)
    file_url = Column(String, nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    author = relationship("User", back_populates="shoutouts_given")
    comments = relationship("Comment", back_populates="shoutout")
    reports = relationship("Report", back_populates="shoutout") # <-- NAYI LINE

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shoutout = relationship("Shoutout", back_populates="comments")
    author = relationship("User", back_populates="comments_made")

class Reaction(Base):
    __tablename__ = "reactions"
    id = Column(Integer, primary_key=True, index=True)
    reaction_type = Column(String, index=True) 
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User")
    shoutout = relationship("Shoutout")

    __table_args__ = (UniqueConstraint('owner_id', 'shoutout_id', name='_user_shoutout_uc'),)

# --- YEH NAYI TABLE ADD HUI HAI (WEEK 6 - REPORT) ---
class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    reason = Column(String, nullable=True) # User bata sakta hai kyu report kiya
    status = Column(String, default='pending') # Status (pending ya resolved)
    
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))
    reported_by_id = Column(Integer, ForeignKey("users.id")) # Kisne report kiya
    
    shoutout = relationship("Shoutout", back_populates="reports")
    reporter = relationship("User")
    
    # Ek user ek post ko ek hi baar report kar sakta hai
    __table_args__ = (UniqueConstraint('reported_by_id', 'shoutout_id', name='_user_report_uc'),)