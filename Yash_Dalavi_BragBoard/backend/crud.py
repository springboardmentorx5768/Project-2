from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import bcrypt
import models, schemas # <-- YAHAN `schemas` ADD KIYA
from typing import Optional
import pandas as pd

# --- User Functions ---
def verify_password(plain_password, hashed_password):
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    password_byte_enc = user.password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_byte_enc, salt)
    
    user_role = 'member' 
    if user.email == 'admin1@example.com':
        user_role = 'admin'
    
    db_user = models.User(
        email=user.email, 
        hashed_password=hashed_password.decode('utf-8'), 
        role=user_role,
        department=user.department or 'general'
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

# --- Brag Sheet Functions ---
def get_user_brag_sheets(db: Session, user_id: int):
    return db.query(models.BragSheet).filter(models.BragSheet.owner_id == user_id).all()
def get_all_brag_sheets(db: Session):
    return db.query(models.BragSheet).all()
def create_user_brag_sheet(db: Session, brag_sheet: schemas.BragSheetCreate, user_id: int):
    db_brag_sheet = models.BragSheet(**brag_sheet.model_dump(), owner_id=user_id)
    db.add(db_brag_sheet)
    db.commit()
    db.refresh(db_brag_sheet)
    return db_brag_sheet

# --- Shoutout & Comment Functions ---
def create_shoutout(db: Session, shoutout: schemas.ShoutoutCreate, author_id: int):
    db_shoutout = models.Shoutout(
        message=shoutout.message,
        tagged_users=shoutout.tagged_users,
        file_url=shoutout.file_url,
        author_id=author_id
    )
    db.add(db_shoutout)
    db.commit()
    db.refresh(db_shoutout)
    return db_shoutout

def get_shoutouts(db: Session, current_user_id: int, skip: int = 0, limit: int = 100, department: Optional[str] = None, sender_email: Optional[str] = None):
    query = db.query(models.Shoutout).options(
        joinedload(models.Shoutout.author),
        joinedload(models.Shoutout.comments).joinedload(models.Comment.author)
    )
    
    query = query.join(models.User, models.Shoutout.author_id == models.User.id)
    
    if department:
        query = query.filter(models.User.department == department)
    if sender_email:
        query = query.filter(models.User.email == sender_email)
        
    all_shoutouts = query.order_by(models.Shoutout.created_at.desc()).offset(skip).limit(limit).all()

    for post in all_shoutouts:
        all_reactions = db.query(models.Reaction).filter(models.Reaction.shoutout_id == post.id).all()
        counts = {"like": 0, "clap": 0, "star": 0}
        for r in all_reactions:
            if r.reaction_type in counts:
                counts[r.reaction_type] += 1
        user_reaction = None
        for r in all_reactions:
            if r.owner_id == current_user_id:
                user_reaction = r.reaction_type
                break
        post.reaction_counts = counts
        post.current_user_reaction = user_reaction
    return all_shoutouts

def create_comment(db: Session, comment: schemas.CommentCreate, shoutout_id: int, author_id: int):
    db_comment = models.Comment(**comment.model_dump(), shoutout_id=shoutout_id, author_id=author_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def manage_reaction(db: Session, shoutout_id: int, user_id: int, reaction_type: str):
    existing_reaction = db.query(models.Reaction).filter(
        models.Reaction.shoutout_id == shoutout_id,
        models.Reaction.owner_id == user_id
    ).first()
    if existing_reaction:
        if existing_reaction.reaction_type == reaction_type:
            db.delete(existing_reaction)
            db.commit()
            return {"detail": "Reaction removed"}
        else:
            existing_reaction.reaction_type = reaction_type
            db.commit()
            db.refresh(existing_reaction)
            return existing_reaction
    else:
        new_reaction = models.Reaction(
            shoutout_id=shoutout_id,
            owner_id=user_id,
            reaction_type=reaction_type
        )
        db.add(new_reaction)
        db.commit()
        db.refresh(new_reaction)
        return new_reaction

def delete_shoutout(db: Session, shoutout_id: int):
    db_shoutout = db.query(models.Shoutout).filter(models.Shoutout.id == shoutout_id).first()
    if not db_shoutout:
        return None 
    db.query(models.Comment).filter(models.Comment.shoutout_id == shoutout_id).delete()
    db.query(models.Reaction).filter(models.Reaction.shoutout_id == shoutout_id).delete()
    db.query(models.Report).filter(models.Report.shoutout_id == shoutout_id).delete()
    db.delete(db_shoutout)
    db.commit()
    return {"detail": "Shoutout deleted"}

def get_admin_statistics(db: Session):
    total_shoutouts = db.query(models.Shoutout).count()
    total_members = db.query(models.User).count()
    top_contributors_query = db.query(
        models.User.email, 
        func.count(models.Shoutout.id).label('shoutout_count')
    ).join(
        models.Shoutout, models.User.id == models.Shoutout.author_id
    ).group_by(
        models.User.email
    ).order_by(
        func.count(models.Shoutout.id).desc()
    ).limit(5).all()
    contributors_list = [{"email": email, "count": count} for email, count in top_contributors_query]
    return {
        "total_shoutouts": total_shoutouts,
        "total_members": total_members,
        "top_contributors": contributors_list
    }

def create_report(db: Session, shoutout_id: int, user_id: int, report: schemas.ReportCreate):
    existing_report = db.query(models.Report).filter(
        models.Report.shoutout_id == shoutout_id,
        models.Report.reported_by_id == user_id
    ).first()
    if existing_report:
        return None 
    db_report = models.Report(
        reason=report.reason,
        shoutout_id=shoutout_id,
        reported_by_id=user_id,
        status="pending"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_pending_reports(db: Session):
    return db.query(models.Report).options(
        joinedload(models.Report.shoutout),
        joinedload(models.Report.reporter)
    ).filter(models.Report.status == 'pending').order_by(models.Report.id.desc()).all()

def resolve_report(db: Session, report_id: int):
    db_report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not db_report:
        return None
    db_report.status = "resolved"
    db.commit()
    db.refresh(db_report)
    return db_report

def get_all_shoutouts_for_export(db: Session):
    query_data = db.query(
        models.Shoutout.id,
        models.Shoutout.message,
        models.Shoutout.tagged_users,
        models.Shoutout.created_at,
        models.User.email.label('author_email')
    ).join(
        models.User, models.Shoutout.author_id == models.User.id
    ).order_by(models.Shoutout.id.desc()).all()
    df = pd.DataFrame(query_data, columns=['ID', 'Message', 'Tagged Users', 'Timestamp', 'Author Email'])
    return df

# --- YEH NAYA FUNCTION ADD HUA HAI (WEEK 6 - LEADERBOARD) ---
def get_leaderboard(db: Session):
    top_contributors_query = db.query(
        models.User.email, 
        func.count(models.Shoutout.id).label('shoutout_count')
    ).join(
        models.Shoutout, models.User.id == models.Shoutout.author_id
    ).group_by(
        models.User.email
    ).order_by(
        func.count(models.Shoutout.id).desc()
    ).limit(10).all() # Top 10 log dikhayenge
    
    # Is data ko schema format mein convert karo (jo schemas.py mein define kiya hai)
    contributors_list = [schemas.ContributorStat(email=email, count=count) for email, count in top_contributors_query]
    return contributors_list