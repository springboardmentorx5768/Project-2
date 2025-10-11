from sqlalchemy.orm import Session
import bcrypt
import models, schemas

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

    # This is the corrected line
    db_user = models.User(email=user.email, hashed_password=hashed_password.decode('utf-8'), role=user.role or 'member')

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
    
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

# --- NEW FUNCTION ADDED BELOW ---
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()