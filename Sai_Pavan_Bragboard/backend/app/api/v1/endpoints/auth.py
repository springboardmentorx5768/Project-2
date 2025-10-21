# In: backend/app/api/v1/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import schemas, crud
from app.db.session import get_db
import os
from app.db.session import engine
from app.core.security import create_access_token
import logging
from sqlalchemy.exc import IntegrityError

router = APIRouter()

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = crud.crud_user.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    logging.info('Register endpoint called for email=%s department=%s', getattr(user, 'email', None), getattr(user, 'department', None))
    try:
        logging.info('Database engine url: %s', getattr(engine, 'url', str(engine)))
    except Exception:
        logging.exception('Could not read engine.url')
    db_user = crud.crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    try:
        created = crud.crud_user.create_user(db=db, user=user)
        return created
    except IntegrityError as ie:
        # Likely a unique constraint violation or similar
        logging.exception("IntegrityError creating user")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Database integrity error during registration")
    except Exception as exc:
        # Log unexpected exceptions and return a safe 500 message
        logging.exception("Unexpected error during user registration")
        # In development, allow returning the exception message to make debugging faster.
        dev_show = os.getenv("DEV_SHOW_ERRORS", "true").lower() in ("1", "true", "yes")
        if dev_show:
            # Return exception text in detail for local debugging only
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")