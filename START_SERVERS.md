# Bragboard - Server Startup Instructions

## Prerequisites

1. **PostgreSQL Database** must be running
2. **Python 3.8+** installed
3. **Node.js and npm** installed

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies (if not already installed):
```bash
pip install -r requirements.txt
```

4. Ensure `.env` file exists in backend directory with:
```
DATABASE_URL=postgresql://postgres:root@localhost:5432/BragBoard
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

5. Start the backend server:
```bash
# Windows
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Or use the batch file
start_backend.bat
```

Backend will run on: **http://127.0.0.1:8000**
API Docs available at: **http://127.0.0.1:8000/docs**

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the frontend server:
```bash
npm run dev

# Or use the batch file
start_frontend.bat
```

Frontend will run on: **http://localhost:5173** (or another port if 5173 is taken)

## Quick Start (Windows)

1. **Backend**: Double-click `backend/start_backend.bat`
2. **Frontend**: Double-click `frontend/start_frontend.bat`

## Troubleshooting

### Backend Errors

1. **Database Connection Error**:
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in `.env` file
   - Verify database credentials

2. **Module Not Found**:
   - Activate virtual environment
   - Run `pip install -r requirements.txt`

3. **Port Already in Use**:
   - Change port in uvicorn command: `--port 8001`
   - Update frontend API_URL if changed

### Frontend Errors

1. **Cannot connect to backend**:
   - Ensure backend is running on port 8000
   - Check CORS settings in backend
   - Verify API_URL in `frontend/src/api.js`

2. **Module Not Found**:
   - Run `npm install`
   - Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Commands Summary

### Backend Commands
```bash
# Activate venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs
- **Static Files (Uploads)**: http://127.0.0.1:8000/uploads/

