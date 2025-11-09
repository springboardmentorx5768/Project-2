from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app import models, schemas

def create_report(db: Session, shoutout_id: int, reporter_id: int, reason: Optional[str]) -> models.Report:
    report = models.Report(
        shoutout_id=shoutout_id,
        reporter_id=reporter_id,
        reason=reason or None,
        status="open",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

def list_reports(db: Session, status: Optional[str] = None) -> List[models.Report]:
    q = db.query(models.Report).order_by(models.Report.created_at.desc())
    if status:
        q = q.filter(models.Report.status == status)
    return q.all()

def resolve_report(db: Session, report_id: int, resolver_id: int) -> Optional[models.Report]:
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        return None
    report.status = "resolved"
    report.resolved_at = datetime.utcnow()
    report.resolved_by = resolver_id
    db.add(report)
    db.commit()
    db.refresh(report)
    return report