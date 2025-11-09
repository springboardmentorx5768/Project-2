from pydantic import BaseModel, ConfigDict

class DepartmentAdminBase(BaseModel):
    user_id: int
    department: str

class DepartmentAdminCreate(DepartmentAdminBase):
    pass

class DepartmentAdmin(DepartmentAdminBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
