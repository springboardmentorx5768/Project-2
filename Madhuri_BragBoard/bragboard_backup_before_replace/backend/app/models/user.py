from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class UserRole(enum.Enum):
    employee = "employee"
    manager = "manager"
    admin = "admin"

class AchievementType(enum.Enum):
    individual = "individual"
    team = "team"
    department = "department"

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    users = relationship("User", back_populates="dept", foreign_keys="User.department_id")
    manager = relationship("User", foreign_keys=[manager_id])
    achievements = relationship("Achievement", back_populates="department")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(60), nullable=False)  # bcrypt hash length
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.employee)
    is_active = Column(Boolean, default=True)
    profile_picture = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    dept = relationship("Department", back_populates="users", foreign_keys=[department_id])
    achievements = relationship("Achievement", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    achievement_type = Column(Enum(AchievementType), default=AchievementType.individual)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    points = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    achieved_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="achievements")
    department = relationship("Department", back_populates="achievements")