# PostgreSQL Setup Instructions

## Prerequisites

1. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/
   - During installation, remember the password you set for the `postgres` user

## Database Setup

### 1. Create Database
Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
-- Connect as postgres user
CREATE DATABASE bragboard_db;

-- Optional: Create a dedicated user
CREATE USER bragboard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bragboard_db TO bragboard_user;
```

### 2. Update Environment Variables
Edit the `.env` file in the Backend directory:

```bash
# Option 1: Using postgres superuser (simpler for development)
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/bragboard_db

# Option 2: Using dedicated user (recommended for production)
DATABASE_URL=postgresql://bragboard_user:your_password@localhost:5432/bragboard_db
```

### 3. Install Dependencies
```bash
cd Backend
pip install -r requirements.txt
```

### 4. Test Connection
```bash
python -c "from database import engine; print('PostgreSQL connection successful!')"
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `SECRET_KEY` | JWT secret key | `your-super-secret-key` |
| `ENVIRONMENT` | Environment mode | `development` or `production` |

## Troubleshooting

### Common Issues:

1. **Connection refused**
   - Ensure PostgreSQL service is running
   - Check if port 5432 is available

2. **Authentication failed**
   - Verify username and password in DATABASE_URL
   - Check PostgreSQL user permissions

3. **Database does not exist**
   - Create the database using the SQL commands above

4. **Permission denied**
   - Grant proper privileges to your database user

### Useful Commands:

```bash
# Check PostgreSQL service status (Windows)
net start postgresql-x64-14

# Connect to PostgreSQL
psql -U postgres -d bragboard_db

# List databases
\l

# List tables
\dt
```

## Migration from SQLite

Your existing SQLite data (`bragboard.db`) will not be automatically migrated. The application will create new tables in PostgreSQL when you first run it.

If you need to migrate existing data, you'll need to:
1. Export data from SQLite
2. Import data into PostgreSQL

For development, starting fresh is usually fine.
