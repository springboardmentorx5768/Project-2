from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import shutil
import os
from pathlib import Path
from database import get_db
from models import ShoutOut, User, ActivityLog, Reaction
from auth import get_current_user

router = APIRouter(prefix="/shoutouts", tags=["shoutouts"])

# Helper function to log activities
def log_activity(db: Session, user_id: int, action_type: str, details: str = "", ip_address: str = ""):
    """Log activity to the database"""
    try:
        activity = ActivityLog(
            user_id=user_id,
            action_type=action_type,
            details=details,
            ip_address=ip_address,
            created_at=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        print(f"Error logging activity: {e}")
        db.rollback()

class ShoutOutCreate(BaseModel):
    title: str
    message: str
    receiver_id: int
    category: str
    is_public: str = "public"
    image_url: Optional[str] = None

class ShoutOutResponse(BaseModel):
    id: int
    title: str
    message: str
    giver_name: str
    receiver_name: str
    giver_department: str
    receiver_department: str
    category: str
    is_public: str
    created_at: datetime
    image_url: Optional[str] = None
    like_count: int = 0
    clap_count: int = 0
    star_count: int = 0
    user_reaction: Optional[str] = None
    
    class Config:
        from_attributes = True

class DepartmentStats(BaseModel):
    department: str
    total_shoutouts: int
    shoutouts_given: int
    shoutouts_received: int

@router.post("/create", response_model=ShoutOutResponse)
def create_shoutout(
    shoutout: ShoutOutCreate, 
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get receiver details
    receiver = db.query(User).filter(User.id == shoutout.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Create shoutout
    new_shoutout = ShoutOut(
        title=shoutout.title,
        message=shoutout.message,
        giver_id=current_user.id,
        receiver_id=shoutout.receiver_id,
        giver_department=current_user.department,
        receiver_department=receiver.department,
        category=shoutout.category,
        is_public=shoutout.is_public,
        image_url=shoutout.image_url
    )
    
    db.add(new_shoutout)
    db.commit()
    db.refresh(new_shoutout)
    
    # Log activity
    ip_address = request.client.host if request and request.client else ""
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="shoutout_created",
        details=f"{receiver.name}",
        ip_address=ip_address
    )
    
    return ShoutOutResponse(
        id=new_shoutout.id,
        title=new_shoutout.title,
        message=new_shoutout.message,
        giver_name=current_user.name,
        receiver_name=receiver.name,
        giver_department=new_shoutout.giver_department,
        receiver_department=new_shoutout.receiver_department,
        category=new_shoutout.category,
        is_public=new_shoutout.is_public,
        created_at=new_shoutout.created_at
    )

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload an image for a shoutout"""
    UPLOAD_DIR = Path("static/uploads")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"shoutout_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{current_user.id}.{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()
    
    return {"image_url": f"/static/uploads/{filename}"}

@router.get("/feed", response_model=List[ShoutOutResponse])
def get_shoutouts_feed(
    department: Optional[str] = Query(None, description="Filter by department. Use 'all' for all departments"),
    sender_id: Optional[int] = Query(None, description="Filter by sender ID"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get shoutouts feed with department-wise filtering"""
    print(f"Received request for shoutouts feed. Department: {department}, User: {current_user.name}")
    
    query = db.query(ShoutOut).join(User, ShoutOut.giver_id == User.id)
    
    # Apply filters
    if department and department != "all":
        # Filter by specific department - show shoutouts where either giver or receiver is from that dept
        query = query.filter(
            or_(
                ShoutOut.giver_department == department,
                ShoutOut.receiver_department == department
            )
        )
        
    if sender_id:
        query = query.filter(ShoutOut.giver_id == sender_id)
        
    if start_date:
        query = query.filter(ShoutOut.created_at >= start_date)
        
    if end_date:
        query = query.filter(ShoutOut.created_at <= end_date)
        
        # Apply visibility rules for department filtering
        if current_user.department == department or current_user.role == "admin":
            # User is from this department or admin - show public + department_only
            query = query.filter(ShoutOut.is_public.in_(["public", "department_only"]))
        else:
            # User is from different department - show only public
            query = query.filter(ShoutOut.is_public == "public")
    else:
        # Show all departments - apply visibility rules
        if current_user.role == "admin":
            # Admin sees everything except private
            query = query.filter(ShoutOut.is_public.in_(["public", "department_only"]))
        else:
            # Regular user sees: public + department_only from their dept
            query = query.filter(
                or_(
                    ShoutOut.is_public == "public",
                    and_(
                        ShoutOut.is_public == "department_only",
                        or_(
                            ShoutOut.giver_department == current_user.department,
                            ShoutOut.receiver_department == current_user.department
                        )
                    )
                )
            )
    
    shoutouts = query.order_by(ShoutOut.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for shoutout in shoutouts:
        giver = db.query(User).filter(User.id == shoutout.giver_id).first()
        receiver = db.query(User).filter(User.id == shoutout.receiver_id).first()
        
        # Get reaction counts
        like_count = db.query(Reaction).filter(
            Reaction.shoutout_id == shoutout.id,
            Reaction.reaction_type == 'like'
        ).count()
        
        clap_count = db.query(Reaction).filter(
            Reaction.shoutout_id == shoutout.id,
            Reaction.reaction_type == 'clap'
        ).count()
        
        star_count = db.query(Reaction).filter(
            Reaction.shoutout_id == shoutout.id,
            Reaction.reaction_type == 'star'
        ).count()
        
        # Get current user's reaction
        user_reaction = db.query(Reaction).filter(
            Reaction.shoutout_id == shoutout.id,
            Reaction.user_id == current_user.id
        ).first()
        
        result.append(ShoutOutResponse(
            id=shoutout.id,
            title=shoutout.title,
            message=shoutout.message,
            giver_name=giver.name,
            receiver_name=receiver.name,
            giver_department=shoutout.giver_department,
            receiver_department=shoutout.receiver_department,
            category=shoutout.category,
            is_public=shoutout.is_public,
            created_at=shoutout.created_at,
            image_url=shoutout.image_url,
            like_count=like_count,
            clap_count=clap_count,
            star_count=star_count,
            user_reaction=user_reaction.reaction_type if user_reaction else None
        ))
    
    return result

@router.get("/my-shoutouts", response_model=List[ShoutOutResponse])
def get_my_shoutouts(
    type: str = Query("all", description="'given', 'received', or 'all'"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's shoutouts (given, received, or both)"""
    
    query = db.query(ShoutOut)
    
    if type == "given":
        query = query.filter(ShoutOut.giver_id == current_user.id)
    elif type == "received":
        query = query.filter(ShoutOut.receiver_id == current_user.id)
    else:  # "all"
        query = query.filter(
            or_(
                ShoutOut.giver_id == current_user.id,
                ShoutOut.receiver_id == current_user.id
            )
        )
    
    shoutouts = query.order_by(ShoutOut.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for shoutout in shoutouts:
        giver = db.query(User).filter(User.id == shoutout.giver_id).first()
        receiver = db.query(User).filter(User.id == shoutout.receiver_id).first()
        
        result.append(ShoutOutResponse(
            id=shoutout.id,
            title=shoutout.title,
            message=shoutout.message,
            giver_name=giver.name,
            receiver_name=receiver.name,
            giver_department=shoutout.giver_department,
            receiver_department=shoutout.receiver_department,
            category=shoutout.category,
            is_public=shoutout.is_public,
            created_at=shoutout.created_at
        ))
    
    return result

@router.get("/departments/stats", response_model=List[DepartmentStats])
def get_department_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get shoutout statistics by department"""
    
    # Get all departments
    departments = db.query(User.department).distinct().all()
    department_list = [dept[0] for dept in departments]
    
    stats = []
    for dept in department_list:
        # Total shoutouts involving this department
        total = db.query(ShoutOut).filter(
            or_(
                ShoutOut.giver_department == dept,
                ShoutOut.receiver_department == dept
            )
        ).count()
        
        # Shoutouts given by this department
        given = db.query(ShoutOut).filter(ShoutOut.giver_department == dept).count()
        
        # Shoutouts received by this department
        received = db.query(ShoutOut).filter(ShoutOut.receiver_department == dept).count()
        
        stats.append(DepartmentStats(
            department=dept,
            total_shoutouts=total,
            shoutouts_given=given,
            shoutouts_received=received
        ))
    
    return sorted(stats, key=lambda x: x.total_shoutouts, reverse=True)

@router.get("/my-stats")
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's shoutout statistics"""
    
    print(f"🔍 Getting stats for user: {current_user.name} (ID: {current_user.id})")
    
    # Total shoutouts given by THIS user
    given = db.query(ShoutOut).filter(ShoutOut.giver_id == current_user.id).count()
    print(f"📤 Shoutouts given by this user: {given}")
    
    # Total shoutouts received by THIS user
    received = db.query(ShoutOut).filter(ShoutOut.receiver_id == current_user.id).count()
    print(f"📥 Shoutouts received by this user: {received}")
    
    # TOTAL SHOUTOUTS IN ENTIRE SYSTEM (regardless of user)
    total_shoutouts_in_system = db.query(ShoutOut).count()
    print(f"📊 TOTAL shoutouts in entire system: {total_shoutouts_in_system}")
    
    result = {
        "total_shoutouts": total_shoutouts_in_system,  # Changed: Now shows ALL shoutouts
        "given": given,
        "received": received
    }
    print(f"✅ Returning stats: {result}")
    
    return result

@router.get("/leaderboard")
def get_leaderboard(
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top contributors leaderboard"""
    from sqlalchemy import func
    
    # Get users with most shoutouts given
    top_givers = db.query(
        User.id,
        User.name,
        User.department,
        func.count(ShoutOut.id).label('count')
    ).join(ShoutOut, User.id == ShoutOut.giver_id)\
     .group_by(User.id, User.name, User.department)\
     .order_by(func.count(ShoutOut.id).desc())\
     .limit(limit)\
     .all()
    
    # Get users with most shoutouts received
    top_receivers = db.query(
        User.id,
        User.name,
        User.department,
        func.count(ShoutOut.id).label('count')
    ).join(ShoutOut, User.id == ShoutOut.receiver_id)\
     .group_by(User.id, User.name, User.department)\
     .order_by(func.count(ShoutOut.id).desc())\
     .limit(limit)\
     .all()
    
    return {
        "top_givers": [
            {
                "id": user.id,
                "name": user.name,
                "department": user.department,
                "count": user.count,
                "rank": idx + 1
            }
            for idx, user in enumerate(top_givers)
        ],
        "top_receivers": [
            {
                "id": user.id,
                "name": user.name,
                "department": user.department,
                "count": user.count,
                "rank": idx + 1
            }
            for idx, user in enumerate(top_receivers)
        ]
    }

@router.get("/users/search")
def search_users_by_department(
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search users by department and name for shoutout creation"""
    
    query = db.query(User).filter(User.id != current_user.id)  # Exclude current user
    
    if department and department != "all":
        query = query.filter(User.department == department)
    
    if search:
        query = query.filter(User.name.ilike(f"%{search}%"))
    
    users = query.limit(20).all()
    
    return [
        {
            "id": user.id,
            "name": user.name,
            "department": user.department,
            "email": user.email
        }
        for user in users
    ]

@router.delete("/{shoutout_id}")
def delete_shoutout(
    shoutout_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a shoutout (only the creator can delete)"""
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")
    
    # Only allow the giver or admin to delete
    if shoutout.giver_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You don't have permission to delete this shoutout")
    
    db.delete(shoutout)
    db.commit()
    
    # Log activity
    ip_address = request.client.host if request and request.client else ""
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="shoutout_deleted",
        details=f"Deleted shoutout #{shoutout_id}",
        ip_address=ip_address
    )
    
    return {"message": "Shoutout deleted successfully"}

