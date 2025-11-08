from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import ActivityLog, User
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/activity", tags=["activity"])

def log_activity(db: Session, user_id: int = None, action_type: str = "", details: str = "", ip_address: str = ""):
    """Helper function to log activities"""
    activity = ActivityLog(
        user_id=user_id,
        action_type=action_type,
        details=details,
        ip_address=ip_address,
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    return activity

@router.get("/logs")
def get_activity_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get activity logs (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    activities = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    
    # Join with user information
    result = []
    for activity in activities:
        user = db.query(User).filter(User.id == activity.user_id).first() if activity.user_id else None
        result.append({
            "id": activity.id,
            "user_id": activity.user_id,
            "user_name": user.name if user else "System",
            "action_type": activity.action_type,
            "details": activity.details,
            "ip_address": activity.ip_address,
            "created_at": activity.created_at.isoformat()
        })
    
    return result

@router.post("/log")
def create_activity_log(
    action_type: str,
    details: str = "",
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create an activity log entry"""
    ip_address = request.client.host if request else ""
    
    activity = log_activity(
        db=db,
        user_id=current_user.id,
        action_type=action_type,
        details=details,
        ip_address=ip_address
    )
    
    return {
        "message": "Activity logged",
        "activity_id": activity.id
    }
