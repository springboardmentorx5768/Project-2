# In: backend/app/schemas/employee_of_month.py
from pydantic import BaseModel, Field
from typing import Optional

class EmployeeOfMonthBase(BaseModel):
    user_id: int
    department: Optional[str] = None
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=3000)
    note: Optional[str] = Field(default=None, max_length=500)

class EmployeeOfMonthCreate(EmployeeOfMonthBase):
    pass

class EmployeeOfMonthOut(BaseModel):
    id: int
    user_id: int
    department: Optional[str] = None
    month: int
    year: int
    note: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
