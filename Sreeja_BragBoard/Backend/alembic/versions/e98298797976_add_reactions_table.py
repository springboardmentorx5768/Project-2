"""add_reactions_table

Revision ID: e98298797976
Revises: 6aa12a12a645
Create Date: 2025-10-29 19:22:22.584242

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'e98298797976'
down_revision: Union[str, Sequence[str], None] = '6aa12a12a645'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create reaction_type enum only if it doesn't exist
    op.execute("DO $$ BEGIN CREATE TYPE reaction_type AS ENUM ('like', 'clap', 'star'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    
    # Create reactions table
    op.create_table(
        'reactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shoutout_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('reaction_type', postgresql.ENUM('like', 'clap', 'star', name='reaction_type', create_type=False), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['shoutout_id'], ['shoutouts.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reactions_id'), 'reactions', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_reactions_id'), table_name='reactions')
    op.drop_table('reactions')
    op.execute('DROP TYPE reaction_type')
