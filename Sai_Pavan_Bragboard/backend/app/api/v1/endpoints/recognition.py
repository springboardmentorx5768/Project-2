from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.api.deps import get_current_admin_user
from app import schemas, models, crud
from app.schemas.employee_of_month import EmployeeOfMonthCreate, EmployeeOfMonthOut

router = APIRouter()

@router.post("/employee-of-month", response_model=EmployeeOfMonthOut, tags=["admin"])
def set_employee_of_month(payload: EmployeeOfMonthCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_admin_user)):
    if payload.month < 1 or payload.month > 12:
        raise HTTPException(status_code=400, detail="Invalid month")
    if payload.year < 2000 or payload.year > 3000:
        raise HTTPException(status_code=400, detail="Invalid year")

    out = crud.crud_recognition.upsert_employee_of_month(db, payload)
    return out

@router.get("/employee-of-month/current", response_model=List[EmployeeOfMonthOut])
def get_current_employee_of_month(db: Session = Depends(get_db)):
    return crud.crud_recognition.list_employee_of_month_current(db)

@router.get("/employee-of-month", response_model=List[EmployeeOfMonthOut])
def get_employee_of_month(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=3000),
    department: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return crud.crud_recognition.list_employee_of_month(
        db,
        month=month,
        year=year,
        department=department,
        limit=limit,
        offset=offset,
    )
