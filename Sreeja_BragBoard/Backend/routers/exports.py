"""Exports Router for generating CSV and PDF reports"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import csv
from io import StringIO
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from database import get_db
from models import Report, ShoutOut, User, Reaction
from auth import get_current_user, is_admin

router = APIRouter(prefix="/exports", tags=["exports"])

def generate_reports_csv(reports_data: List[dict]) -> StreamingResponse:
    """Generate CSV from reports data"""
    output = StringIO()
    writer = csv.writer(output)
    
    # Write headers
    headers = [
        "Report ID", "Shoutout Title", "Reporter", "Reason", 
        "Details", "Status", "Created At", "Resolved At", 
        "Resolved By"
    ]
    writer.writerow(headers)
    
    # Write data rows
    for report in reports_data:
        writer.writerow([
            report["id"],
            report["shoutout_title"],
            report["reporter_name"],
            report["reason"],
            report["details"],
            report["status"],
            report["created_at"],
            report["resolved_at"] or "",
            report["resolver_name"] or ""
        ])
    
    # Prepare the response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            'Content-Disposition': f'attachment; filename=reports_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        }
    )

@router.get("/reports/csv")
async def export_reports_csv(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export reports to CSV"""
    # Verify admin access
    if not await is_admin(current_user, db):
        raise HTTPException(status_code=403, detail="Only admins can export reports")

    # Query reports with joins to get related data
    query = db.query(Report)
    if status:
        query = query.filter(Report.status == status)
    
    reports = query.all()
    
    # Prepare data for CSV
    reports_data = []
    for report in reports:
        shoutout = db.query(ShoutOut).filter(ShoutOut.id == report.shoutout_id).first()
        reporter = db.query(User).filter(User.id == report.reporter_id).first()
        resolver = db.query(User).filter(User.id == report.resolved_by).first() if report.resolved_by else None
        
        reports_data.append({
            "id": report.id,
            "shoutout_title": shoutout.title if shoutout else "Deleted Shoutout",
            "reporter_name": reporter.name if reporter else "Unknown",
            "reason": report.reason,
            "details": report.details or "",
            "status": report.status,
            "created_at": report.created_at.isoformat(),
            "resolved_at": report.resolved_at.isoformat() if report.resolved_at else None,
            "resolver_name": resolver.name if resolver else None
        })
    
    return generate_reports_csv(reports_data)