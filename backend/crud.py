from sqlalchemy.orm import Session, joinedload
import bcrypt
import models, schemas

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
    db_user = models.User(email=user.email, hashed_password=hashed_password.decode('utf-8'), role=user.role or 'member')
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

# --- NEW SHOUTOUT & COMMENT FUNCTIONS ---

def create_shoutout(db: Session, shoutout: schemas.ShoutoutCreate, author_id: int):
    # This function now handles an optional file_url
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

def get_shoutouts(db: Session, skip: int = 0, limit: int = 100):
    # This now loads the author and comments for each shoutout
    return db.query(models.Shoutout).options(
        joinedload(models.Shoutout.author),
        joinedload(models.Shoutout.comments).joinedload(models.Comment.author)
    ).order_by(models.Shoutout.id.desc()).offset(skip).limit(limit).all()

def create_comment(db: Session, comment: schemas.CommentCreate, shoutout_id: int, author_id: int):
    db_comment = models.Comment(**comment.model_dump(), shoutout_id=shoutout_id, author_id=author_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment