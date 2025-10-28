from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default='member')
    department = Column(String, default='general') # <-- NEW COLUMN
    
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

    author = relationship("User", back_populates="shoutouts_given")
    comments = relationship("Comment", back_populates="shoutout")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))

    shoutout = relationship("Shoutout", back_populates="comments")
    author = relationship("User", back_populates="comments_made")