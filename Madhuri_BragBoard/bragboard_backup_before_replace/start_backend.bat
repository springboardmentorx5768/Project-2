@echo off
cd /d "C:\Users\puppa\Downloads\bragboard"
call .venv\Scripts\activate.bat
echo Starting BragBoard Backend Server...
echo Backend will be available at: http://127.0.0.1:8000
echo API Documentation: http://127.0.0.1:8000/docs
echo.
echo Keep this window open while using the app!
echo.
python simple_backend.py
pause