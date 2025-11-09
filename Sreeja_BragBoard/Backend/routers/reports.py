"""Reports Router for handling shoutout reports"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Report, User, ShoutOut
from auth import get_current_user, is_admin

router = APIRouter(prefix="/reports", tags=["reports"])

# Pydantic models
class ReportCreate(BaseModel):
    shoutout_id: int
    reason: str
    details: Optional[str] = None

class ReportUpdate(BaseModel):
    status: str
    note: Optional[str] = None

class ReportResponse(BaseModel):
    id: int
    shoutout_id: int
    shoutout_title: str
    reporter_name: str
    reason: str
    details: Optional[str]
    status: str
    created_at: str
    resolved_at: Optional[str]
    resolver_name: Optional[str]

    class Config:
        from_attributes = True

@router.post("/", response_model=ReportResponse)
async def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new report for a shoutout"""
    # Verify shoutout exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == report.shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")

    # Create report
    new_report = Report(
        shoutout_id=report.shoutout_id,
        reporter_id=current_user.id,
        reason=report.reason,
        details=report.details
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return prepare_report_response(db, new_report)

@router.get("/", response_model=List[ReportResponse])
async def get_reports(
    status: Optional[str] = Query(None, enum=["pending", "resolved", "dismissed"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all reports (admin only)"""
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Only admins can view reports")
    
    query = db.query(Report)
    if status:
        query = query.filter(Report.status == status)
    
    reports = query.order_by(desc(Report.created_at)).all()
    return [prepare_report_response(db, report) for report in reports]

@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    update: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a report's status (admin only)"""
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Only admins can update reports")
    
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status = update.status
    if update.status in ["resolved", "dismissed"]:
        report.resolved_at = datetime.utcnow()
        report.resolved_by = current_user.id
    
    db.commit()
    db.refresh(report)
    
    return prepare_report_response(db, report)

def prepare_report_response(db: Session, report: Report) -> ReportResponse:
    """Helper function to prepare report response"""
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == report.shoutout_id).first()
    reporter = db.query(User).filter(User.id == report.reporter_id).first()
    resolver = db.query(User).filter(User.id == report.resolved_by).first() if report.resolved_by else None
    
    return ReportResponse(
        id=report.id,
        shoutout_id=report.shoutout_id,
        shoutout_title=shoutout.title if shoutout else "Deleted Shoutout",
        reporter_name=reporter.name if reporter else "Unknown",
        reason=report.reason,
        details=report.details,
        status=report.status,
        created_at=report.created_at.isoformat(),
        resolved_at=report.resolved_at.isoformat() if report.resolved_at else None,
        resolver_name=resolver.name if resolver else None
    )