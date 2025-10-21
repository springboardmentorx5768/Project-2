from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class UserRole(str, enum.Enum):
    employee = "employee"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String(60), nullable=False)
    department = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.employee, nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())