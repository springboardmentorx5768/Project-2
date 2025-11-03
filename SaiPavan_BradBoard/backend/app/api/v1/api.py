from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, shoutouts, analytics, reactions, comments

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(shoutouts.router, prefix="/shoutouts", tags=["shoutouts"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(reactions.router, tags=["reactions"])
api_router.include_router(comments.router, tags=["comments"])
