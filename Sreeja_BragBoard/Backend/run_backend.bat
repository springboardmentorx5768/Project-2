@echo off
cd /d "%~dp0"
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bragboard
set SECRET_KEY=your-super-secret-key-change-in-production
.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
