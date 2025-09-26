from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from .auth import get_current_admin_user
from .auth import get_password_hash
from .auth import get_password_hash  # <-- add this
from .auth import get_current_admin_user


from . import auth, crud, schemas
from .database import get_db
from .models import User

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/admin-only-route")
async def admin_action(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admins can reach here
    return {"msg": f"Hello, admin {current_admin.username}"}




# ---------------- REGISTER ----------------
@router.post("/register", response_model=schemas.UserOut)
async def register_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # check if email/username exists
    if await crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = get_password_hash(user.password)

    new_user = await crud.create_user(
        db,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,  # use role from request
        name=user.name
    )
    return new_user


# ---------------- LOGIN ----------------
@router.post("/login", response_model=schemas.Token)
async def login_user(
    response: Response,  # put first, no default
    user_credentials: schemas.UserLogin,
    db: AsyncSession = Depends(get_db)
):
    # Use email instead of username
    user = await auth.authenticate_user(db, user_credentials.email, user_credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=auth.settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = auth.create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta=refresh_token_expires
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=60 * 60 * 24 * auth.settings.REFRESH_TOKEN_EXPIRE_DAYS,
        samesite="lax",
        secure=False
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# ---------------- REFRESH ----------------
@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        payload = jwt.decode(refresh_token, auth.settings.SECRET_KEY, algorithms=[auth.settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    q = select(User).where(User.id == user_id)
    res = await db.execute(q)
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# ---------------- LOGOUT ----------------
@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"msg": "logged out"}

# ---------------- CURRENT USER ----------------
@router.get("/me", response_model=schemas.UserOut)
async def me(token: str = Depends(auth.oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, auth.settings.SECRET_KEY, algorithms=[auth.settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    q = select(User).where(User.id == user_id)
    res = await db.execute(q)
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
