"""add_comments_table

Revision ID: 7b8bfdd7fbbb
Revises: e98298797976
Create Date: 2025-10-29 20:09:11.277025

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b8bfdd7fbbb'
down_revision: Union[str, Sequence[str], None] = 'e98298797976'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
