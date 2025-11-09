"""Analytics API Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from pydantic import BaseModel
from database import get_db
from models import ShoutOut, User
from auth import get_current_user, is_admin

router = APIRouter(prefix="/analytics", tags=["analytics"])

class UserStatsResponse(BaseModel):
    user_id: int
    name: str
    department: str
    shoutouts_given: int
    shoutouts_received: int
    engagement_score: float

@router.get("/top-contributors", response_model=List[UserStatsResponse])
async def get_top_contributors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10
):
    """Get top contributors based on shoutouts given and received"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")
    
    # Get shoutouts given and received for each user
    stats = db.query(
        User.id,
        User.name,
        User.department,
        func.count(ShoutOut.id).filter(ShoutOut.giver_id == User.id).label('shoutouts_given'),
        func.count(ShoutOut.id).filter(ShoutOut.receiver_id == User.id).label('shoutouts_received')
    ).outerjoin(
        ShoutOut,
        (ShoutOut.giver_id == User.id) | (ShoutOut.receiver_id == User.id)
    ).group_by(
        User.id
    ).all()
    
    # Calculate engagement score (you can adjust the formula)
    result = []
    for stat in stats:
        engagement_score = (stat.shoutouts_given * 0.6) + (stat.shoutouts_received * 0.4)
        result.append(UserStatsResponse(
            user_id=stat.id,
            name=stat.name,
            department=stat.department,
            shoutouts_given=stat.shoutouts_given,
            shoutouts_received=stat.shoutouts_received,
            engagement_score=round(engagement_score, 2)
        ))
    
    # Sort by engagement score and return top N
    result.sort(key=lambda x: x.engagement_score, reverse=True)
    return result[:limit]

class DepartmentStatsResponse(BaseModel):
    department: str
    total_shoutouts: int
    internal_shoutouts: int
    external_shoutouts: int

@router.get("/department-stats", response_model=List[DepartmentStatsResponse])
async def get_department_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get shoutout statistics by department"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")
    
    departments = db.query(User.department).distinct().all()
    result = []
    
    for dept in departments:
        department = dept[0]
        total_shoutouts = db.query(func.count(ShoutOut.id)).filter(
            (ShoutOut.giver_department == department) | (ShoutOut.receiver_department == department)
        ).scalar()
        
        internal_shoutouts = db.query(func.count(ShoutOut.id)).filter(
            ShoutOut.giver_department == department,
            ShoutOut.receiver_department == department
        ).scalar()
        
        external_shoutouts = total_shoutouts - internal_shoutouts
        
        result.append(DepartmentStatsResponse(
            department=department,
            total_shoutouts=total_shoutouts,
            internal_shoutouts=internal_shoutouts,
            external_shoutouts=external_shoutouts
        ))
    
    return result