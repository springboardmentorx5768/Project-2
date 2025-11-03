# In: backend/app/api/v1/endpoints/analytics.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud
from app.db.session import get_db

router = APIRouter()

@router.get("/insights", response_model=schemas.AdminInsights)
def read_admin_insights(db: Session = Depends(get_db)):
    return crud.crud_analytics.get_admin_insights(db=db)

@router.get("/leaderboard", response_model=List[schemas.LeaderboardEntry])
def read_leaderboard(db: Session = Depends(get_db)):
    return crud.crud_analytics.get_leaderboard(db=db)

@router.get("/departments", response_model=List[schemas.DepartmentHighlight])
def read_department_highlights(db: Session = Depends(get_db)):
    return crud.crud_analytics.get_department_highlights(db=db)