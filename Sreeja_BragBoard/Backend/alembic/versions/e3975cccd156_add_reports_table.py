"""add_reports_table

Revision ID: e3975cccd156
Revises: 25e5b6334131
Create Date: 2025-11-07 21:17:24.010354

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3975cccd156'
down_revision: Union[str, Sequence[str], None] = '25e5b6334131'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create report_status enum
    op.execute("DO $$ BEGIN CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed'); EXCEPTION WHEN duplicate_object THEN null; END $$;")

    # Create reports table
    op.create_table(
        'reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shoutout_id', sa.Integer(), nullable=False),
        sa.Column('reporter_id', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'resolved', 'dismissed', name='report_status', create_type=False), nullable=False, server_default='pending'),
        sa.Column('resolved_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['reporter_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['resolved_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['shoutout_id'], ['shoutouts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reports_id'), 'reports', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_reports_id'), table_name='reports')
    op.drop_table('reports')
    op.execute('DROP TYPE report_status')
