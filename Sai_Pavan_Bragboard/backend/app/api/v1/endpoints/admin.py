from fastapi import APIRouter, Depends, HTTPException, Response
from typing import List, Optional
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_current_main_admin_user, get_current_user
from app.db.session import get_db
from app import models, crud, schemas
from app.crud import crud_score
from app.core.config import settings

router = APIRouter()

@router.post("/users/{user_id}/promote", tags=["admin"])
def promote_user_to_admin(
	user_id: int,
	db: Session = Depends(get_db),
	_: models.User = Depends(get_current_main_admin_user),
):
	user = db.query(models.User).filter(models.User.id == user_id).first()
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	user.is_superuser = True
	db.add(user)
	db.commit()
	db.refresh(user)
	return {"message": "User promoted to admin", "user_id": user.id}

@router.post("/users/{user_id}/demote", tags=["admin"])
def demote_user_from_admin(
	user_id: int,
	db: Session = Depends(get_db),
	current_main: models.User = Depends(get_current_main_admin_user),
):
	user = db.query(models.User).filter(models.User.id == user_id).first()
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	# Prevent demoting the main admin
	if user.email == settings.MAIN_ADMIN_EMAIL:
		raise HTTPException(status_code=400, detail="Cannot demote main admin")
	user.is_superuser = False
	db.add(user)
	db.commit()
	return {"message": "User demoted from admin", "user_id": user.id}

@router.delete("/users/{user_id}", tags=["admin"])
def admin_delete_user(
	user_id: int,
	db: Session = Depends(get_db),
	current_admin: models.User = Depends(get_current_admin_user),
):
	"""Hard delete a user and their content by an admin (irreversible)."""
	user = db.query(models.User).filter(models.User.id == user_id).first()
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	if user.email == settings.MAIN_ADMIN_EMAIL:
		raise HTTPException(status_code=400, detail="Cannot delete main admin user")
	# Optionally prevent an admin from deleting themselves via admin API
	# if user.id == current_admin.id:
	#     raise HTTPException(status_code=400, detail="Admins cannot delete their own account via admin API")

	# Perform deep delete via CRUD utility
	from app.crud.crud_user import hard_delete_user
	hard_delete_user(db, user)
	return {"message": "User and associated data deleted by admin", "user_id": user_id}

@router.post("/users/{user_id}/approve", tags=["admin"])
def approve_user(
	user_id: int,
	db: Session = Depends(get_db),
	_: models.User = Depends(get_current_admin_user),
):
	"""Approve a newly registered user so they can log in."""
	user = db.query(models.User).filter(models.User.id == user_id).first()
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	if user.is_approved:
		return {"message": "User already approved", "user_id": user.id}
	user.is_approved = True
	if not user.is_active:
		user.is_active = True
	db.add(user)
	db.commit()
	db.refresh(user)
	return {"message": "User approved", "user_id": user.id}

@router.get("/users/pending", response_model=List[schemas.user.UserOut], tags=["admin"])
def list_pending_users(
	db: Session = Depends(get_db),
	_: models.User = Depends(get_current_admin_user),
):
	"""Return users that are not yet approved."""
	return db.query(models.User).filter(models.User.is_approved == False).all()

# Department admin scoping endpoints
@router.post("/department-admins/{user_id}/{department}", tags=["admin"])
def assign_department_admin(
	user_id: int,
	department: str,
	db: Session = Depends(get_db),
	_: models.User = Depends(get_current_main_admin_user),
):
	"""Assign a user as an admin for a specific department. Main admin only."""
	user = db.query(models.User).filter(models.User.id == user_id).first()
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	# Normalize department case
	dept_norm = department.strip()
	existing = db.query(models.DepartmentAdmin).filter(models.DepartmentAdmin.user_id == user_id, models.DepartmentAdmin.department == dept_norm).first()
	if existing:
		return {"message": "Already department admin", "user_id": user_id, "department": dept_norm}
	role = models.DepartmentAdmin(user_id=user_id, department=dept_norm)
	db.add(role)
	db.commit()
	db.refresh(role)
	return {"message": "Department admin assigned", "user_id": user_id, "department": dept_norm}

@router.delete("/department-admins/{user_id}/{department}", tags=["admin"])
def revoke_department_admin(
	user_id: int,
	department: str,
	db: Session = Depends(get_db),
	_: models.User = Depends(get_current_main_admin_user),
):
	"""Revoke a user's department admin role. Main admin only."""
	dept_norm = department.strip()
	role = db.query(models.DepartmentAdmin).filter(models.DepartmentAdmin.user_id == user_id, models.DepartmentAdmin.department == dept_norm).first()
	if not role:
		raise HTTPException(status_code=404, detail="Department admin role not found")
	db.delete(role)
	db.commit()
	return {"message": "Department admin revoked", "user_id": user_id, "department": dept_norm}

@router.get("/department-admins", tags=["admin"], response_model=List[schemas.DepartmentAdmin])
def list_department_admins(
	db: Session = Depends(get_db),
	_: models.User = Depends(get_current_admin_user),
):
	return db.query(models.DepartmentAdmin).all()

@router.get("/department-admins/me", tags=["admin"], response_model=List[schemas.DepartmentAdmin])
def my_department_admin_roles(
	db: Session = Depends(get_db),
	current_user: models.User = Depends(get_current_user),
):
	return db.query(models.DepartmentAdmin).filter(models.DepartmentAdmin.user_id == current_user.id).all()

@router.delete("/shoutouts/{shoutout_id}", tags=["admin"])
def admin_delete_shoutout(
	shoutout_id: int,
	db: Session = Depends(get_db),
	_: models.User = Depends(get_current_admin_user),
):
	shoutout = db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id).first()
	if not shoutout:
		raise HTTPException(status_code=404, detail="Shoutout not found")
	author_id = shoutout.sender_id
	db.delete(shoutout)
	db.commit()
	try:
		crud_score.apply_shoutout_deleted(db, author_id)
	except Exception:
		pass
	return {"message": "Shoutout deleted by admin"}

@router.delete("/comments/{comment_id}", tags=["admin"])
def admin_delete_comment(
	comment_id: int,
	db: Session = Depends(get_db),
	_: models.User = Depends(get_current_admin_user),
):
	comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
	if not comment:
		raise HTTPException(status_code=404, detail="Comment not found")
	db.delete(comment)
	db.commit()
	return {"message": "Comment deleted by admin"}

@router.get("/reports/export", response_class=Response, tags=["admin"])
def export_reports_csv(
	db: Session = Depends(get_db),
	_: models.User = Depends(get_current_admin_user),
):
	"""Export simple leaderboard and department highlights as CSV for now."""
	import csv
	from io import StringIO

	output = StringIO()
	writer = csv.writer(output)

	# Leaderboard
	writer.writerow(["Leaderboard"]) 
	writer.writerow(["Rank", "Name", "Sent", "Received"]) 
	leaderboard = crud.crud_analytics.get_leaderboard(db)
	for entry in leaderboard:
		writer.writerow([entry.rank, entry.name, entry.sent, entry.received])

	writer.writerow([])
	writer.writerow(["Department Highlights"]) 
	writer.writerow(["Department", "Shoutout Count"]) 
	departments = crud.crud_analytics.get_department_highlights(db)
	for d in departments:
		writer.writerow([d.department, d.count])

	csv_data = output.getvalue()
	headers = {
		"Content-Disposition": "attachment; filename=reports.csv",
		"Content-Type": "text/csv",
	}
	return Response(content=csv_data, media_type="text/csv", headers=headers)

@router.get("/reports", response_model=List[schemas.report.ReportOut], tags=["admin"])
def list_reports(status: Optional[str] = None, db: Session = Depends(get_db), _: models.User = Depends(get_current_admin_user)):
	return crud.crud_report.list_reports(db, status=status)

@router.post("/reports/{report_id}/resolve", response_model=schemas.report.ReportOut, tags=["admin"])
def resolve_report(report_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin_user)):
	resolved = crud.crud_report.resolve_report(db, report_id=report_id, resolver_id=current_admin.id)
	if not resolved:
		raise HTTPException(status_code=404, detail="Report not found")
	return resolved
