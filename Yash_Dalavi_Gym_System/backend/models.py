from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default='member')
    
    brag_sheets = relationship("BragSheet", back_populates="owner")

class BragSheet(Base):
    __tablename__ = "brag_sheets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    project_name = Column(String, index=True)
    countofmember = Column(Integer)
    skills = Column(String)
    finance = Column(String, nullable=True) # <-- THIS LINE WAS MISSING
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="brag_sheets")