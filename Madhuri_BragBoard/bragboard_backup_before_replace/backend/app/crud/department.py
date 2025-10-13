from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.user import Department, User
from app.schemas.department import DepartmentCreate, DepartmentUpdate
from typing import List, Optional

def get_department(db: Session, department_id: int) -> Optional[Department]:
    return db.query(Department).filter(Department.id == department_id).first()

def get_department_by_name(db: Session, name: str) -> Optional[Department]:
    return db.query(Department).filter(Department.name == name).first()

def get_departments(db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
    return db.query(Department).offset(skip).limit(limit).all()

def create_department(db: Session, department: DepartmentCreate) -> Department:
    db_department = Department(
        name=department.name,
        description=department.description,
        manager_id=department.manager_id
    )
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

def update_department(db: Session, department_id: int, department: DepartmentUpdate) -> Optional[Department]:
    db_department = get_department(db, department_id)
    if db_department:
        update_data = department.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_department, field, value)
        db.commit()
        db.refresh(db_department)
    return db_department

def delete_department(db: Session, department_id: int) -> bool:
    db_department = get_department(db, department_id)
    if db_department:
        db.delete(db_department)
        db.commit()
        return True
    return False

def get_department_with_stats(db: Session, department_id: int):
    department = get_department(db, department_id)
    if not department:
        return None
    
    user_count = db.query(func.count(User.id)).filter(User.department_id == department_id).scalar()
    # Achievement count will be added when we create the achievement crud
    
    return {
        **department.__dict__,
        "user_count": user_count,
        "achievement_count": 0  # Placeholder
    }