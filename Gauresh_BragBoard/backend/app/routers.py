import os
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi import UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import timedelta
from jose import jwt, JWTError
from .models import ShoutOut, ShoutOutTag, User, SecurityKey
from passlib.context import CryptContext
import secrets
from typing import Optional, List
from . import models, schemas
from .auth import get_current_admin_user, get_current_user, get_password_hash
from . import auth, crud, schemas
from .database import get_db
from .models import User, SecurityKey
from .models import User, ShoutOut, ShoutOutTag, ShoutOutReaction, ShoutOutComment, SecurityKey
from sqlalchemy import func

router = APIRouter()
router = APIRouter(prefix="/auth", tags=["Auth"])
auth_router = APIRouter(prefix="/auth", tags=["Auth"])
admin_router = APIRouter(prefix="/admin", tags=["Admin"])
open_router = APIRouter(tags=["Posts"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login") 


# ---------------- GET ALL EMPLOYEES ----------------
@admin_router.get("/employees", response_model=List[schemas.UserOut])
async def list_employees(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch employees based on admin's department.
    Superadmins can see all employees.
    Regular admins can see only employees in their department.
    """
    if current_admin.role == "superadmin":
        # Superadmin sees all employees
        query = select(User).where(User.role == "employee")
    else:
        # Department-wise scoping
        query = select(User).where(
            User.role == "employee",
            User.department == current_admin.department
        )

    result = await db.execute(query)
    employees = result.scalars().all()
    return employees

# ---------------- GET ALL ADMINS ----------------
@admin_router.get("/admins", response_model=List[schemas.UserOut])
async def list_admins(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Superadmin can view all admins"""
    if current_admin.role != "superadmin":
        raise HTTPException(status_code=403, detail="Forbidden: Only superadmin can view admins")
    
    result = await db.execute(select(User).where(User.role == "admin"))
    admins = result.scalars().all()
    return admins

# ---------------- DELETE ADMIN ----------------
@admin_router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    if current_admin.role != "superadmin":
        raise HTTPException(status_code=403, detail="Forbidden: Only superadmin can delete admins")
    
    result = await db.execute(select(User).where(User.id == admin_id, User.role == "admin"))
    admin = result.scalars().first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    await db.delete(admin)
    await db.commit()
    return {"msg": "Admin deleted successfully"}




# ---------------- DELETE EMPLOYEE ----------------
@admin_router.delete("/employees/{emp_id}")
async def delete_employee(
    emp_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == emp_id, User.role == "employee"))
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    await db.delete(employee)
    await db.commit()
    return {"msg": "Employee deleted successfully"}

# ---------------- SUSPEND / UNSUSPEND EMPLOYEE ----------------
@admin_router.patch("/employees/{emp_id}/suspend")
async def suspend_employee(
    emp_id: int,
    suspend: bool,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Suspend or unsuspend employee"""
    result = await db.execute(select(User).where(User.id == emp_id, User.role == "employee"))
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Add a new column to User model called 'is_active' (Boolean, default=True)
    employee.is_active = not suspend
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return {"msg": f"Employee {'suspended' if suspend else 'activated'} successfully"}

# ---------------- ADMIN-ONLY ROUTE ----------------
@router.post("/admin-only-route")
async def admin_action(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    return {"msg": f"Hello, admin {current_admin.username}"}

# ---------------- REGISTER ----------------
@router.post("/register", response_model=schemas.UserOut)
async def register_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email/username exists
    if await crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Security Key Check for admin registration
    if user.role == "admin":
        if not user.security_key:
            raise HTTPException(status_code=403, detail="Security key is required for admin registration")
        q = select(SecurityKey).where(SecurityKey.key == user.security_key, SecurityKey.is_used == False)
        res = await db.execute(q)
        key_obj = res.scalars().first()
        if not key_obj:
            raise HTTPException(status_code=403, detail="Invalid or already used security key")
        # Mark key as used
        key_obj.is_used = True
        await db.commit()

    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = await crud.create_user(
        db,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        name=user.name,
        department=user.department
    )
    return new_user

# ---------------- LOGIN ----------------
@router.post("/login", response_model=schemas.Token)
async def login_user(
    response: Response,
    user_credentials: schemas.UserLogin,
    db: AsyncSession = Depends(get_db)
):
    user = await auth.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

    refresh_token_expires = timedelta(days=auth.settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = auth.create_refresh_token(data={"sub": str(user.id)}, expires_delta=refresh_token_expires)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=60 * 60 * 24 * auth.settings.REFRESH_TOKEN_EXPIRE_DAYS,
        samesite="lax",
        secure=False
    )

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

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
    access_token = auth.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

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

# ---------------- SECURITY KEY MANAGEMENT ----------------
def generate_security_key(length=16) -> str:
    """Generate a secure random URL-safe key"""
    return secrets.token_urlsafe(length)

# Create a new security key (admin-only)
@router.post("/security-keys", dependencies=[Depends(get_current_admin_user)])
async def create_security_key(db: AsyncSession = Depends(get_db)):
    key_value = generate_security_key(16)
    new_key = SecurityKey(key=key_value)
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)
    return {"security_key": new_key.key, "id": new_key.id}

# List all security keys (admin-only)
@router.get("/security-keys", dependencies=[Depends(get_current_admin_user)])
async def list_security_keys(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SecurityKey))
    keys = result.scalars().all()
    return [{"id": k.id, "key": k.key, "is_used": k.is_used} for k in keys]

# Delete a security key (admin-only)
@router.delete("/security-keys/{key_id}", dependencies=[Depends(get_current_admin_user)])
async def delete_security_key(key_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SecurityKey).where(SecurityKey.id == key_id))
    key_obj = result.scalars().first()
    if not key_obj:
        raise HTTPException(status_code=404, detail="Key not found")
    await db.delete(key_obj)
    await db.commit()
    return {"msg": "Key deleted"}


# ✅ Fetch department-wise employees (used for dropdown)
@router.get("/department-employees")
async def get_department_employees(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = await db.execute(select(User).where(User.department == current_user.department))
    employees = query.scalars().all()
    return [{"id": emp.id, "name": emp.name} for emp in employees]


# ✅ Update profile details
@router.put("/update-profile", response_model=schemas.UserOut)
async def update_profile(
    user_update: schemas.UpdateProfile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = await db.execute(select(User).where(User.id == current_user.id))
    user = query.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.joining_date = user_update.joining_date
    user.current_project = user_update.current_project
    user.group_members = ",".join(user_update.group_members)

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


    # ---------------- SHOUT-OUTS ----------------
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
os.makedirs(uploads_dir, exist_ok=True)


@router.post("/shoutouts", response_model=schemas.ShoutOutOut)
async def create_shoutout(
    message: str = Form(...),
    tagged_user_ids: Optional[str] = Form(None),  # comma-separated ids
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    image_url = None
    if image is not None:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid4().hex}{ext}"
        filepath = os.path.join(uploads_dir, filename)
        content = await image.read()
        with open(filepath, "wb") as f:
            f.write(content)
        image_url = f"/uploads/{filename}"

    new_shout = ShoutOut(author_id=current_user.id, message=message, image_url=image_url)
    db.add(new_shout)
    await db.flush()  # get id

    # tags
    user_ids: List[int] = []
    if tagged_user_ids:
        try:
            user_ids = [int(x) for x in tagged_user_ids.split(",") if x.strip()]
        except ValueError:
            user_ids = []
    for uid in user_ids:
        db.add(ShoutOutTag(shoutout_id=new_shout.id, user_id=uid))

    await db.commit()
    await db.refresh(new_shout)

    return schemas.ShoutOutOut(
        id=new_shout.id,
        author_id=new_shout.author_id,
        author_name=current_user.name,  # <- add this
        message=new_shout.message,
        image_url=new_shout.image_url,
        created_at=new_shout.created_at.isoformat() if new_shout.created_at else None,
        tagged_users=user_ids,
        reactions={},
    )


@router.get("/shoutouts/feed", response_model=List[schemas.ShoutOutOut])
async def get_feed(
    db: AsyncSession = Depends(get_db),
    
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(
        select(ShoutOut).order_by(ShoutOut.created_at.desc()).limit(100)
    )
    shoutouts = res.scalars().all()

    # 2 Add this here: fetch author names
    author_ids = list({s.author_id for s in shoutouts})
    authors: dict[int, str] = {}
    if author_ids:
        res_authors = await db.execute(select(User).where(User.id.in_(author_ids)))
        users = res_authors.scalars().all()
        authors = {u.id: u.name for u in users}

    # gather tags
    shoutout_ids = [s.id for s in shoutouts]
    tags_map = {sid: [] for sid in shoutout_ids}
    tag_names_map = {sid: [] for sid in shoutout_ids}
    if shoutout_ids:
        res_tags = await db.execute(select(ShoutOutTag, User.name).join(User, User.id == ShoutOutTag.user_id).where(ShoutOutTag.shoutout_id.in_(shoutout_ids)))
        for t, name in res_tags.all():
            tags_map[t.shoutout_id].append(t.user_id)
            tag_names_map[t.shoutout_id].append(name or str(t.user_id))

    # gather reactions counts as {emoji: count}
    reactions_map = {sid: {} for sid in shoutout_ids}
    if shoutout_ids:
        res_rx = await db.execute(
            select(ShoutOutReaction.shoutout_id, ShoutOutReaction.emoji, func.count(ShoutOutReaction.id))
            .where(ShoutOutReaction.shoutout_id.in_(shoutout_ids))
            .group_by(ShoutOutReaction.shoutout_id, ShoutOutReaction.emoji)
        )
        for sid, emoji, cnt in res_rx.all():
            reactions_map[sid][emoji] = int(cnt)

    # comments count per shoutout
    comments_count = {sid: 0 for sid in shoutout_ids}
    if shoutout_ids:
        res_cc = await db.execute(
            select(ShoutOutComment.shoutout_id, func.count(ShoutOutComment.id))
            .where(ShoutOutComment.shoutout_id.in_(shoutout_ids))
            .group_by(ShoutOutComment.shoutout_id)
        )
        for sid, cnt in res_cc.all():
            comments_count[sid] = int(cnt)

    out: List[schemas.ShoutOutOut] = []
    for s in shoutouts:
        out.append(
            schemas.ShoutOutOut(
                id=s.id,
                author_id=s.author_id,
                author_name=authors.get(s.author_id, "Anonymous"),  # <- fetch actual author
                message=s.message,
                image_url=s.image_url,
                created_at=s.created_at.isoformat() if s.created_at else None,
                tagged_users=tags_map.get(s.id, []),
                tagged_user_names=tag_names_map.get(s.id, []),
                reactions=reactions_map.get(s.id, {}),
                comments_count=comments_count.get(s.id, 0),
            )
        )
    return out


@router.post("/shoutouts/{shoutout_id}/react")
async def react_shoutout(
    shoutout_id: int,
    body: schemas.ReactionIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if the user has reacted before
    res = await db.execute(
        select(ShoutOutReaction).where(
            ShoutOutReaction.shoutout_id == shoutout_id,
            ShoutOutReaction.user_id == current_user.id
        )
    )
    existing = res.scalars().first()

    if existing:
        if existing.emoji == body.emoji:
            # User clicked the same reaction → remove it
            await db.delete(existing)
            await db.commit()
            return {"msg": "reaction removed"}
        else:
            # User clicked a different reaction → update it
            existing.emoji = body.emoji
            db.add(existing)
            await db.commit()
            return {"msg": "reaction updated"}
    else:
        # User never reacted → add new reaction
        reaction = ShoutOutReaction(
            shoutout_id=shoutout_id,
            user_id=current_user.id,
            emoji=body.emoji
        )
        db.add(reaction)
        await db.commit()
        return {"msg": "reaction added"}

@router.post("/shoutouts/{shoutout_id}/comments", response_model=schemas.CommentOut)
async def add_comment(
    shoutout_id: int,
    body: schemas.CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = ShoutOutComment(shoutout_id=shoutout_id, user_id=current_user.id, content=body.content)
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return schemas.CommentOut(
        id=c.id,
        shoutout_id=c.shoutout_id,
        user_id=c.user_id,
        content=c.content,
        created_at=c.created_at.isoformat() if c.created_at else None,
    )


@router.get("/shoutouts/{shoutout_id}/comments", response_model=List[schemas.CommentOut])
async def list_comments(
    shoutout_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(
        select(ShoutOutComment)
        .where(ShoutOutComment.shoutout_id == shoutout_id)
        .order_by(ShoutOutComment.created_at.asc())
    )
    out: List[schemas.CommentOut] = []
    for c in res.scalars().all():
        out.append(
            schemas.CommentOut(
                id=c.id,
                shoutout_id=c.shoutout_id,
                user_id=c.user_id,
                content=c.content,
                created_at=c.created_at.isoformat() if c.created_at else None,
            )
        )
    return out


@router.get("/metrics/me")
async def my_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # counts
    given = await db.execute(select(func.count(ShoutOut.id)).where(ShoutOut.author_id == current_user.id))
    received = await db.execute(
        select(func.count(ShoutOutTag.id)).where(ShoutOutTag.user_id == current_user.id)
    )
    comments = await db.execute(
        select(func.count(ShoutOutComment.id)).where(ShoutOutComment.user_id == current_user.id)
    )

    # recent activity (last 10)
    recent: List[dict] = []
    res_recent_given = await db.execute(
        select(ShoutOut).where(ShoutOut.author_id == current_user.id).order_by(ShoutOut.created_at.desc()).limit(5)
    )
    for s in res_recent_given.scalars().all():
        recent.append({
            "type": "given",
            "message": s.message,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })

    res_recent_received = await db.execute(
        select(ShoutOut, ShoutOutTag).join(ShoutOutTag, ShoutOutTag.shoutout_id == ShoutOut.id)
        .where(ShoutOutTag.user_id == current_user.id)
        .order_by(ShoutOut.created_at.desc()).limit(5)
    )
    for s, _ in res_recent_received.all():
        recent.append({
            "type": "received",
            "message": s.message,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })

    res_recent_comments = await db.execute(
        select(ShoutOutComment).where(ShoutOutComment.user_id == current_user.id)
        .order_by(ShoutOutComment.created_at.desc()).limit(5)
    )
    for c in res_recent_comments.scalars().all():
        recent.append({
            "type": "comment",
            "message": c.content,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })

    # sort and cap
    recent.sort(key=lambda r: r.get("created_at") or "", reverse=True)
    recent = recent[:10]

    return {
        "shoutouts_given": int(given.scalar() or 0),
        "shoutouts_received": int(received.scalar() or 0),
        "comments_made": int(comments.scalar() or 0),
        "recent": recent,
    }


