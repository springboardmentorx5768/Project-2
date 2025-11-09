# In: backend/app/schemas/__init__.py
# (REPLACE the entire file with this)

from .token import Token, TokenData  # <-- This line is now fixed
from .user import User, UserCreate, UserUpdate, UserOut, UserSettings, UserSettingsUpdate
from .shoutout import Shoutout, ShoutoutCreate
from .analytics import LeaderboardEntry, DepartmentHighlight, AdminInsights
from .report import ReportCreate, ReportOut
from .reaction import Reaction, ReactionCreate
from .comment import Comment, CommentCreate
from .attachment import Attachment, AttachmentCreate, AttachmentOut
from .badge import BadgeOut
from .department_admin import DepartmentAdmin, DepartmentAdminCreate