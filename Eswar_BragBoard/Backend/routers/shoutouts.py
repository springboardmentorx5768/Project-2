from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import ShoutOut, User, ShoutOutRecipient
from auth import get_current_user

router = APIRouter(prefix="/shoutouts", tags=["shoutouts"])

class ShoutOutCreate(BaseModel):
    title: Optional[str] = None
    message: str
    receiver_id: int
    category: Optional[str] = None
    is_public: str = "public"

class ShoutOutCreateMulti(BaseModel):
    title: Optional[str] = None
    message: str
    recipient_ids: List[int]
    category: Optional[str] = None
    is_public: str = "public"

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get receiver details
    receiver = db.query(User).filter(User.id == shoutout.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Derive title if not provided
    derived_title = shoutout.title or (shoutout.message[:60].strip() or "Shout-Out")

    # Create shoutout
    new_shoutout = ShoutOut(
        title=derived_title,
        message=shoutout.message,
        giver_id=current_user.id,
        receiver_id=shoutout.receiver_id,
        giver_department=current_user.department,
        receiver_department=receiver.department,
        category=(shoutout.category or "teamwork"),
        is_public=shoutout.is_public
    )
    
    db.add(new_shoutout)
    db.commit()
    db.refresh(new_shoutout)
    
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

@router.post("/create-multi", response_model=List[ShoutOutResponse])
def create_shoutout_multi(
    payload: ShoutOutCreateMulti,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a shoutout with multiple recipients. The first recipient is stored as primary for compatibility."""
    if not payload.recipient_ids:
        raise HTTPException(status_code=400, detail="At least one recipient is required")

    # Validate recipients and collect their details
    receivers = db.query(User).filter(User.id.in_(payload.recipient_ids)).all()
    receiver_map = {u.id: u for u in receivers}
    missing = [rid for rid in payload.recipient_ids if rid not in receiver_map]
    if missing:
        raise HTTPException(status_code=404, detail=f"Recipients not found: {missing}")

    # Use first recipient as primary receiver for legacy fields
    primary = receiver_map[payload.recipient_ids[0]]

    # Derive title if not provided
    derived_title = payload.title or (payload.message[:60].strip() or "Shout-Out")

    new_shoutout = ShoutOut(
        title=derived_title,
        message=payload.message,
        giver_id=current_user.id,
        receiver_id=primary.id,
        giver_department=current_user.department,
        receiver_department=primary.department,
        category=(payload.category or "teamwork"),
        is_public=payload.is_public
    )

    db.add(new_shoutout)
    db.flush()  # get shoutout id before adding recipients

    # Add all recipients to join table (including primary)
    for rid in payload.recipient_ids:
        db.add(ShoutOutRecipient(shoutout_id=new_shoutout.id, recipient_id=rid))

    db.commit()
    db.refresh(new_shoutout)

    responses: List[ShoutOutResponse] = []
    for rid in payload.recipient_ids:
        r = receiver_map[rid]
        responses.append(ShoutOutResponse(
            id=new_shoutout.id,
            title=new_shoutout.title,
            message=new_shoutout.message,
            giver_name=current_user.name,
            receiver_name=r.name,
            giver_department=new_shoutout.giver_department,
            receiver_department=r.department,
            category=new_shoutout.category,
            is_public=new_shoutout.is_public,
            created_at=new_shoutout.created_at
        ))

    return responses

@router.get("/feed", response_model=List[ShoutOutResponse])
def get_shoutouts_feed(
    department: Optional[str] = Query(None, description="Filter by department. Use 'all' for all departments"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get shoutouts feed with department-wise filtering
    - department='all' or None: Show all public shoutouts + department-only from user's dept
    - department='engineering': Show shoutouts related to engineering department
    - etc.
    """
    
    query = db.query(ShoutOut).join(User, ShoutOut.giver_id == User.id)
    
    if department and department != "all":
        # Filter by specific department - show shoutouts where either giver or receiver is from that dept
        query = query.filter(
            or_(
                ShoutOut.giver_department == department,
                ShoutOut.receiver_department == department
            )
        )
        
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
