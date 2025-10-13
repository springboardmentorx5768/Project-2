from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.department import Department, DepartmentCreate, DepartmentUpdate, DepartmentWithStats
from app.crud import department as crud_department
from app.crud.user import can_access_department

router = APIRouter()

@router.get("/", response_model=List[Department])
def read_departments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all departments (admin only) or user's department."""
    if current_user.role != "admin":
        if current_user.department_id:
            department = crud_department.get_department(db, current_user.department_id)
            return [department] if department else []
        return []
    
    return crud_department.get_departments(db, skip=skip, limit=limit)

@router.post("/", response_model=Department)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new department (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create departments"
        )
    
    # Check if department name already exists
    if crud_department.get_department_by_name(db, department.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department name already exists"
        )
    
    return crud_department.create_department(db, department)

@router.get("/{department_id}", response_model=DepartmentWithStats)
def read_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get department by ID with statistics."""
    if not can_access_department(current_user, department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this department"
        )
    
    department = crud_department.get_department_with_stats(db, department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    return department

@router.put("/{department_id}", response_model=Department)
def update_department(
    department_id: int,
    department: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update department (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update departments"
        )
    
    db_department = crud_department.update_department(db, department_id, department)
    if not db_department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    return db_department

@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete department (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete departments"
        )
    
    if not crud_department.delete_department(db, department_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    return {"message": "Department deleted successfully"}