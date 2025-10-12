# BragBoard

A modern web application built with React + FastAPI for employee recognition and achievements.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Authentication**: JWT tokens
- **Development**: Python virtual environment + Node.js

## Project Structure

```
bragboard/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── models/    # Database models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── crud/      # Database operations
│   │   ├── api/       # API routes
│   │   └── core/      # Configuration and utilities
│   ├── requirements.txt
│   └── main.py
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/ # Reusable components
│   │   ├── services/  # API services
│   │   └── utils/     # Utilities
│   ├── package.json
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate virtual environment:

   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:

   ```bash
   # Create .env file with:
   DATABASE_URL=postgresql://username:password@localhost/bragboard
   SECRET_KEY=your-secret-key-here
   ```

5. Run the backend:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the frontend:
   ```bash
   npm run dev
   ```

## Features

- ✅ User registration and authentication
- ✅ JWT-based session management
- ✅ Secure password hashing
- ✅ Role-based access (employee/admin)
- ✅ Responsive UI with Tailwind CSS

## API Endpoints

- `POST /register` - User registration
- `POST /login/token` - User login
- `GET /users/me` - Get current user profile

## Development

The application runs on:

- Backend: http://localhost:8001
- Frontend: http://localhost:5173

Both servers support hot reloading for development.

## Quick Start

1. **Start both servers using VS Code tasks:**

   - Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Type "Tasks: Run Task"
   - Select "Start Both Servers"

2. **Or start them manually:**

   ```bash
   # Terminal 1 - Backend
   cd backend
   C:/Users/puppa/Downloads/bragboard/.venv/Scripts/python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8001

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

3. **Open the application:**
   - Frontend: http://localhost:5173
   - Backend API docs: http://localhost:8001/docs
