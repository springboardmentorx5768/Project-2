# In: backend/app/models/employee_of_month.py

from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import date
from app.db.base import Base

class EmployeeOfMonth(Base):
    __tablename__ = 'employee_of_month'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    department = Column(String, nullable=True)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    note = Column(String, nullable=True)
    effective_date = Column(Date, default=date.today, nullable=False)

    user = relationship('User')

    __table_args__ = (
        UniqueConstraint('department', 'month', 'year', name='uq_dept_month_year'),
    )
