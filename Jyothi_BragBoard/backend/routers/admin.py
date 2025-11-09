from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, aliased
from database import get_db
from database_models import User, ShoutOut, ShoutOutTag, ShoutOutReport, Comment, ShoutOutReaction
from auth import get_current_user
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta
from fastapi.responses import StreamingResponse
import csv
from io import StringIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from fastapi.responses import StreamingResponse
from io import BytesIO
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle,Spacer, Paragraph
from reportlab.lib import colors


router = APIRouter(prefix="/admin", tags=["Admin"])

def admin_required(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


#  Top Contributors
@router.get("/top-contributors")
def top_contributors(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    result = db.query(
      User.username,
      func.count(ShoutOut.id).label("sent_count")
    ).join(ShoutOut, ShoutOut.giver_id == User.id)\
     .filter(ShoutOut.is_deleted == False)\
     .group_by(User.id)\
     .order_by(func.count(ShoutOut.id).desc())\
     .limit(5).all()


    formatted = [{"username": r[0], "shoutout_count": r[1]} for r in result]

    return formatted


#  Most Tagged Users
@router.get("/most-tagged")
def most_tagged(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    result = db.query(
        User.username,
        func.count(ShoutOutTag.id).label("tag_count")
    ).join(ShoutOutTag, ShoutOutTag.tagged_user_id == User.id)\
     .group_by(User.id)\
     .order_by(func.count(ShoutOutTag.id).desc())\
     .limit(5).all()

    formatted = [{"username": r[0], "tag_count": r[1]} for r in result]

    return formatted

# Admin Stats
DEPARTMENTS = [
    "Engineering",
    "Human Resources",
    "Sales",
    "Marketing",
    "Finance",
    "Operations",
    "Design",
]

@router.get("/stats")
def admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    total_users = db.query(User).count()
    total_departments = len(DEPARTMENTS)


    total_shoutouts = db.query(ShoutOut).filter(ShoutOut.is_deleted == False).count()
    total_reactions = (
      db.query(ShoutOutReaction)
      .join(ShoutOut, ShoutOutReaction.shoutout_id == ShoutOut.id)
      .filter(ShoutOut.is_deleted == False)
      .count()
    )

    total_reports = db.query(ShoutOutReport).count()
    pending_reports = db.query(ShoutOutReport).filter(ShoutOutReport.status == "pending").count()
    resolved_reports = db.query(ShoutOutReport).filter(ShoutOutReport.status == "resolved").count()

    # Top contributor (most shoutouts sent)
    top_user = (
        db.query(User.username, func.count(ShoutOut.id).label("sent_count"))
        .join(ShoutOut, ShoutOut.giver_id == User.id)
        .filter(ShoutOut.is_deleted == False)
        .group_by(User.id)
        .order_by(func.count(ShoutOut.id).desc())
        .first()
    )

    return {
        "total_users": total_users,
        "total_departments": total_departments,
        "total_shoutouts": total_shoutouts,
        "total_reactions": total_reactions,
        "total_reports": total_reports,
        "pending_reports": pending_reports,
        "resolved_reports": resolved_reports,
        "top_contributor": top_user[0] if top_user else None,
    }

#  Get Reported Shoutouts (All / Pending / Resolved)
@router.get("/reports")
def get_reports(
    filter: str = "all", 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    admin_required(current_user)

    reporter = aliased(User)
    reported_user = aliased(User)
    admin_user = aliased(User)

    query = (
        db.query(
            ShoutOutReport.id.label("report_id"),
            ShoutOutReport.reason,
            ShoutOutReport.status.label("report_status"),
            ShoutOutReport.created_at.label("report_submitted"),

            reporter.username.label("reporter_name"),
            reported_user.username.label("reported_username"),

            ShoutOut.id.label("shoutout_id"),
            ShoutOut.message.label("shoutout_message"),
            ShoutOut.is_deleted.label("is_deleted"),

            admin_user.username.label("admin_name")
        )
        .join(reporter, ShoutOutReport.reporter_id == reporter.id)
        .join(ShoutOut, ShoutOutReport.shoutout_id == ShoutOut.id)
        .join(reported_user, ShoutOut.giver_id == reported_user.id)
        .outerjoin(admin_user, ShoutOutReport.action_taken_by == admin_user.id)
        .order_by(ShoutOutReport.created_at.desc())
    )

    if filter == "pending":
        query = query.filter(ShoutOutReport.status == "pending")
    elif filter == "resolved":
        query = query.filter(ShoutOutReport.status == "resolved")

    rows = query.all()

    return [
        {
            "report_id": r.report_id,
            "reason": r.reason,
            "reporter_name": r.reporter_name,
            "reported_username": r.reported_username,
            "report_status": r.report_status,
            "report_submitted": r.report_submitted,
            "shoutout_id": r.shoutout_id,
            "admin_name": r.admin_name if r.admin_name else "-",
            "shoutout_status": "Deleted" if r.is_deleted else "Active",
        }
        for r in rows
    ]

#  Resolve a Report
@router.post("/reports/{report_id}/resolve")
def resolve_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)
    report = db.query(ShoutOutReport).filter(ShoutOutReport.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    report.status = "resolved"
    report.updated_at = datetime.utcnow()
    report.action_taken_by = current_user.id
    db.commit()
    return {"message": "Report resolved"}

#  Admin Delete Shoutout
@router.delete("/shoutout/{shoutout_id}/admin-delete")
def admin_delete_shoutout(shoutout_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    shout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shout:
        raise HTTPException(404, "Shoutout not found")

    shout.is_deleted = True

    db.query(Comment).filter(Comment.shoutout_id == shoutout_id).update({"is_deleted": True})

    db.query(ShoutOutReaction).filter(ShoutOutReaction.shoutout_id == shoutout_id).update({"is_deleted": True})

    reports = db.query(ShoutOutReport).filter(ShoutOutReport.shoutout_id == shoutout_id).all()
    for r in reports:
        r.status = "resolved"
        r.updated_at = datetime.utcnow()
        r.action_taken_by = current_user.id

    db.commit()
    return {"message": "Shoutout, its comments and reactions deleted, related reports resolved"}

#  Admin Delete comment
@router.delete("/comment/{comment_id}")
def admin_delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment.is_deleted = True
    db.commit()
    return {"message": "Comment deleted by admin"}

# --- Top Departments (counts of shoutouts per department) -------
@router.get("/top-departments")
def top_departments(limit: int = Query(8), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    results = (
        db.query(
            ShoutOut.giver_department.label("department"),
            func.count(ShoutOut.id).label("shoutout_count")
        )
        .filter(ShoutOut.is_deleted == False)
        .filter(ShoutOut.giver_department.isnot(None))
        .filter(ShoutOut.giver_department != "")
        .group_by(ShoutOut.giver_department)
        .order_by(func.count(ShoutOut.id).desc())
        .limit(limit)
        .all()
    )

    return [{"department": r.department, "shoutout_count": int(r.shoutout_count)} for r in results]

# --- Activity Trend (shoutouts per day for last N days) ---
@router.get("/activity-trend")
def activity_trend(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns shoutout counts per day for the last `days` days (default 30).
    Response: [{date: "YYYY-MM-DD", count: 3}, ...]
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)  # inclusive

    # Query counts grouped by date (shoutout.created_at cast to date)
    q = (
        db.query(cast(ShoutOut.created_at, Date).label("date"), func.count(ShoutOut.id).label("cnt"))
        .filter(ShoutOut.is_deleted == False)
        .filter(cast(ShoutOut.created_at, Date) >= start_date)
        .group_by(cast(ShoutOut.created_at, Date))
        .order_by(cast(ShoutOut.created_at, Date))
    )

    rows = {r.date.isoformat(): int(r.cnt) for r in q.all()}

    # Build full series for days with zeros
    series = []
    for i in range(days):
        d = (start_date + timedelta(days=i)).isoformat()
        series.append({"date": d, "count": rows.get(d, 0)})

    return series


#-----------------csv exports----------------------
@router.get("/export/shoutouts/csv")
def export_shoutouts_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    if not current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    # Fetch active shoutouts
    shoutouts = db.query(ShoutOut).filter(ShoutOut.is_deleted == False).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Giver", "Receiver", "Message", "Tags", "Date"])

    for s in shoutouts:
        tags = ",".join([str(t.tagged_user_id) for t in s.tags])
        writer.writerow([
          s.id,
          s.giver.username,
          s.receiver.username if s.receiver else "",
          s.message,
          tags,
          s.created_at.strftime("%Y-%m-%d %H:%M")
    ])

    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=shoutouts.csv"})

#------------------------pdf export--------------------------
@router.get("/export/shoutouts/pdf")
def export_shoutouts_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    # Fetch data
    shoutouts = db.query(ShoutOut).filter(ShoutOut.is_deleted == False).all()
    top_contributors = db.query(User).join(ShoutOut, ShoutOut.giver_id == User.id)\
        .filter(ShoutOut.is_deleted == False)\
        .group_by(User.id)\
        .order_by(func.count(ShoutOut.id).desc())\
        .limit(5).all()
    most_tagged_users = db.query(User).join(ShoutOutTag, ShoutOutTag.tagged_user_id == User.id)\
        .group_by(User.id)\
        .order_by(func.count(ShoutOutTag.id).desc())\
        .limit(5).all()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # --- Shoutouts Table ---
    elements.append(Paragraph("Shoutouts Report", styles['Heading2']))
    data1 = [["ID", "Giver", "Receiver", "Message", "Tags", "Date"]]
    for s in shoutouts:
        tags = ", ".join([str(t.tagged_user_id) for t in s.tags])
        message = s.message if len(s.message) <= 50 else s.message[:50] + "..."
        data1.append([s.id, s.giver.username, s.receiver.username, message, tags, s.created_at.strftime("%Y-%m-%d")])
    table1 = Table(data1, repeatRows=1)
    table1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#C7D2FE")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('ALIGN',(0,0),(-1,-1),'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.whitesmoke, colors.lightgrey]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.black)
    ]))
    elements.append(table1)
    elements.append(Spacer(1, 30))

    # --- Top Contributors Table ---
    elements.append(Paragraph("Top Contributors", styles['Heading2']))
    data2 = [["Contributor", "Shoutouts Sent"]]
    for u in top_contributors:
        sent_count = len([s for s in u.given_shoutouts if not s.is_deleted])
        data2.append([u.username, sent_count])
    table2 = Table(data2, repeatRows=1)
    table2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#FCE7F3")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#9D174D")),
        ('ALIGN',(0,0),(-1,-1),'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.whitesmoke, colors.lightgrey]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.black)
    ]))
    elements.append(table2)
    elements.append(Spacer(1, 30))

    # --- Most Tagged Users Table ---
    elements.append(Paragraph("Most Tagged Users", styles['Heading2']))
    data3 = [["User", "Tags Count"]]
    for u in most_tagged_users:
        tag_count = len([t for t in u.received_shoutouts if not t.is_deleted])
        data3.append([u.username, tag_count])
    table3 = Table(data3, repeatRows=1)
    table3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#FEF3C7")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#92400E")),
        ('ALIGN',(0,0),(-1,-1),'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.whitesmoke, colors.lightgrey]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.black)
    ]))
    elements.append(table3)

    doc.build(elements)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=shoutouts_report.pdf"})