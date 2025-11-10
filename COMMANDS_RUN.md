# Commands Run to Start Backend and Frontend

## Summary of Fixes Applied

1. **Fixed database.py** - Added automatic conversion of `postgresql://` to `postgresql+asyncpg://` for async operations
2. **Fixed test_db_router.py** - Updated to use `text()` for SQL queries
3. **Fixed upload directory paths** - Made paths relative to backend directory
4. **Installed missing packages** - aiofiles and python-multipart in virtual environment
5. **Updated requirements.txt** - Fixed python-multipart version requirement

## Commands Executed

### Backend Setup and Start

```powershell
# 1. Navigate to backend directory
cd C:\Users\KALYAN\OneDrive\Desktop\Bragboard-main\backend

# 2. Install missing packages in virtual environment
.\venv\Scripts\pip.exe install aiofiles python-multipart

# 3. Verify imports work
.\venv\Scripts\python.exe test_imports.py

# 4. Start backend server
.\venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup and Start

```powershell
# 1. Navigate to frontend directory
cd C:\Users\KALYAN\OneDrive\Desktop\Bragboard-main\frontend

# 2. Install dependencies (if needed)
npm install

# 3. Start frontend server
npm run dev
```

## Quick Start Commands

### Option 1: Using Batch Files (Easiest)

**Backend:**
```bash
cd backend
start_backend.bat
```

**Frontend:**
```bash
cd frontend
start_frontend.bat
```

### Option 2: Manual Start

**Backend:**
```bash
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Server URLs

- **Backend API**: http://127.0.0.1:8000
- **Backend Docs**: http://127.0.0.1:8000/docs
- **Frontend**: http://localhost:5173 (or check console for actual port)

## Verification

To verify everything is working:

1. **Backend**: Open http://127.0.0.1:8000/docs in browser - should show Swagger UI
2. **Frontend**: Open http://localhost:5173 - should show the application
3. **Database**: Ensure PostgreSQL is running and accessible

## Files Created/Modified

1. `backend/app/database.py` - Added async URL conversion
2. `backend/app/test_db_router.py` - Fixed SQL query execution
3. `backend/app/routes/shoutout_router.py` - Fixed upload directory path
4. `backend/app/main.py` - Fixed upload directory path
5. `backend/app/routes/admin_analytics_router.py` - Fixed leaderboard query
6. `backend/requirements.txt` - Updated python-multipart version
7. `backend/start_backend.bat` - Created startup script
8. `frontend/start_frontend.bat` - Created startup script
9. `backend/test_imports.py` - Created test script

## Troubleshooting

If you encounter issues:

1. **Backend won't start**:
   - Ensure virtual environment is activated
   - Check that PostgreSQL is running
   - Verify .env file exists with correct DATABASE_URL
   - Run `.\venv\Scripts\pip.exe install -r requirements.txt`

2. **Frontend won't start**:
   - Run `npm install` in frontend directory
   - Check that backend is running on port 8000
   - Verify API URL in `frontend/src/api.js`

3. **Database connection errors**:
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Ensure database "BragBoard" exists

## Next Steps

1. Start both servers using the commands above
2. Access the application at http://localhost:5173
3. Register a user or login
4. Test the shout-out functionality
5. Test reactions and comments
6. Access admin dashboard for analytics

