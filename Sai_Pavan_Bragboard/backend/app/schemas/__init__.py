# In: backend/app/schemas/__init__.py
# (REPLACE the entire file with this)

from .token import Token, TokenData  # <-- This line is now fixed
from .user import User, UserCreate, UserOut
from .shoutout import Shoutout, ShoutoutCreate
from .analytics import LeaderboardEntry, DepartmentHighlight, AdminInsights