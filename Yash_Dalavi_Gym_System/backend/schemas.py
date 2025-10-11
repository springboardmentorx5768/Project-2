from pydantic import BaseModel, EmailStr
from typing import List

# --- BragSheet Schemas ---
class BragSheetBase(BaseModel):
    name: str
    project_name: str
    countofmember: int
    skills: str
    finance: str | None = None

class BragSheetCreate(BragSheetBase):
    pass

class BragSheet(BragSheetBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str | None = "member" # <-- THIS LINE WAS MISSING

class User(UserBase):
    id: int
    is_active: bool
    role: str
    brag_sheets: List[BragSheet] = []

    class Config:
        from_attributes = True