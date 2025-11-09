# In: backend/app/crud/crud_recognition.py
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app import models
from app.schemas.employee_of_month import EmployeeOfMonthCreate


def upsert_employee_of_month(db: Session, payload: EmployeeOfMonthCreate):
    # Normalize department: treat empty string as None so we don't create duplicate rows
    dept = (payload.department or None) or None
    if isinstance(dept, str):
        dept = dept.strip() or None

    # Try to find existing record for department-month-year (also match legacy rows that stored '' instead of NULL)
    q = db.query(models.EmployeeOfMonth).filter(
        models.EmployeeOfMonth.month == payload.month,
        models.EmployeeOfMonth.year == payload.year,
    )
    if dept is None:
        # Match rows where department IS NULL or empty string (legacy)
        q = q.filter(
            (models.EmployeeOfMonth.department.is_(None)) | (models.EmployeeOfMonth.department == "")
        )
    else:
        q = q.filter(models.EmployeeOfMonth.department == dept)
    record = q.first()

    if record:
        record.user_id = payload.user_id
        record.note = payload.note
        # Clean up legacy empty-string department
        if record.department == "" and dept is None:
            record.department = None
    else:
        record = models.EmployeeOfMonth(
            user_id=payload.user_id,
            department=dept,
            month=payload.month,
            year=payload.year,
            note=payload.note,
        )
        db.add(record)

    db.commit()
    db.refresh(record)

    # Attach display name for convenience
    user = db.query(models.User).filter(models.User.id == record.user_id).first()
    out = {
        'id': record.id,
        'user_id': record.user_id,
        'department': record.department,
        'month': record.month,
        'year': record.year,
        'note': record.note,
        'user_name': user.full_name if user else None,
    }
    return out


def list_employee_of_month_current(db: Session):
    # List by department for current month
    from datetime import datetime
    now = datetime.utcnow()
    month = now.month
    year = now.year
    rows = db.query(models.EmployeeOfMonth).filter(
        models.EmployeeOfMonth.month == month,
        models.EmployeeOfMonth.year == year,
    ).all()
    # Join names
    user_map = {u.id: u.full_name for u in db.query(models.User).all()}
    return [
        {
            'id': r.id,
            'user_id': r.user_id,
            'department': r.department,
            'month': r.month,
            'year': r.year,
            'note': r.note,
            'user_name': user_map.get(r.user_id),
        }
        for r in rows
    ]


def list_employee_of_month(db: Session, month: int | None = None, year: int | None = None, department: str | None = None, limit: int = 50, offset: int = 0):
    q = db.query(models.EmployeeOfMonth)
    if month:
        q = q.filter(models.EmployeeOfMonth.month == month)
    if year:
        q = q.filter(models.EmployeeOfMonth.year == year)
    if department:
        q = q.filter(models.EmployeeOfMonth.department == department)
    q = q.order_by(models.EmployeeOfMonth.year.desc(), models.EmployeeOfMonth.month.desc())
    q = q.offset(offset).limit(limit)
    rows = q.all()
    user_map = {u.id: u.full_name for u in db.query(models.User).all()}
    return [
        {
            'id': r.id,
            'user_id': r.user_id,
            'department': r.department,
            'month': r.month,
            'year': r.year,
            'note': r.note,
            'user_name': user_map.get(r.user_id),
        }
        for r in rows
    ]
