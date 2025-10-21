from pydantic import BaseModel
from .user import UserOut

class UserStats(BaseModel):
    shoutouts_sent: int
    shoutouts_received: int
    reactions_given: int
    comments_posted: int

class LeaderboardUser(BaseModel):
    user: UserOut
    score: int