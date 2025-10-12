from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI(title="BragBoard Simple API")

# Enable CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# JWT settings
SECRET_KEY = "your-secret-key-change-this"
ALGORITHM = "HS256"

def create_token(email: str):
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode = {"sub": email, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def init_db():
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    # Create departments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create users table with department reference
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'employee',
            department_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments (id)
        )
    ''')
    
    # Create achievements table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            points INTEGER DEFAULT 0,
            user_id INTEGER NOT NULL,
            department_id INTEGER NOT NULL,
            is_featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (department_id) REFERENCES departments (id)
        )
    ''')
    
    # Check if departments exist
    cursor.execute('SELECT COUNT(*) FROM departments')
    if cursor.fetchone()[0] == 0:
        # Create sample departments
        departments = [
            ('Engineering', 'Software development and technical teams'),
            ('Marketing', 'Marketing and communications teams'),
            ('Sales', 'Sales and business development teams'),
            ('HR', 'Human resources and administration'),
            ('Finance', 'Finance and accounting teams')
        ]
        
        cursor.executemany('''
            INSERT INTO departments (name, description)
            VALUES (?, ?)
        ''', departments)
        
        conn.commit()
        print("✅ Created sample departments")
    
    # Check if test users exist
    cursor.execute('SELECT COUNT(*) FROM users WHERE email = ?', ('22a31a4424@gmail.com',))
    if cursor.fetchone()[0] == 0:
        # Get engineering department ID
        cursor.execute('SELECT id FROM departments WHERE name = ?', ('Engineering',))
        eng_dept_id = cursor.fetchone()[0]
        
        # Create test users
        test_password = hash_password("password123")
        
        cursor.execute('''
            INSERT INTO users (email, password, name, role, department_id)
            VALUES (?, ?, ?, ?, ?)
        ''', ('22a31a4424@gmail.com', test_password, 'Puppa User', 'admin', eng_dept_id))
        
        cursor.execute('''
            INSERT INTO users (email, password, name, role, department_id)
            VALUES (?, ?, ?, ?, ?)
        ''', ('test@test.com', test_password, 'Test User', 'employee', eng_dept_id))
        
        # Get marketing department ID
        cursor.execute('SELECT id FROM departments WHERE name = ?', ('Marketing',))
        marketing_dept_id = cursor.fetchone()[0]
        
        cursor.execute('''
            INSERT INTO users (email, password, name, role, department_id)
            VALUES (?, ?, ?, ?, ?)
        ''', ('manager@test.com', test_password, 'Manager User', 'manager', marketing_dept_id))
        
        conn.commit()
        print("✅ Created test users with departments")
    
    conn.close()

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "BragBoard Simple API", "status": "running"}

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(credentials: UserLogin):
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    try:
        # Get user with department info
        cursor.execute('''
            SELECT u.id, u.email, u.password, u.name, u.role, u.department_id, d.name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.email = ?
        ''', (credentials.email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(credentials.password, user[2]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create token
        token = create_token(user[1])
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user[0],
                "email": user[1],
                "name": user[3],
                "role": user[4],
                "department_id": user[5],
                "department_name": user[6]
            }
        }
    
    finally:
        conn.close()

@app.post("/api/auth/register", response_model=LoginResponse)
async def register(user_data: UserRegister):
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    try:
        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (user_data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Get default department (Engineering) for new users
        cursor.execute('SELECT id FROM departments WHERE name = ?', ('Engineering',))
        dept_result = cursor.fetchone()
        department_id = dept_result[0] if dept_result else 1  # Default to department 1
        
        # Hash password and create user
        hashed_password = hash_password(user_data.password)
        cursor.execute('''
            INSERT INTO users (email, password, name, role, department_id)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_data.email, hashed_password, user_data.full_name, 'employee', department_id))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # Get department name for response
        cursor.execute('SELECT name FROM departments WHERE id = ?', (department_id,))
        department_name = cursor.fetchone()[0]
        
        # Create token for immediate login
        token = create_token(user_data.email)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user_data.email,
                "name": user_data.full_name,
                "role": "employee",
                "department_id": department_id,
                "department_name": department_name
            }
        }
    
    finally:
        conn.close()

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Remove 'Bearer ' prefix
        token = authorization.replace('Bearer ', '')
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/auth/me")
async def get_current_user(email: str = Depends(verify_token)):
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    try:
        # Get user with department info
        cursor.execute('''
            SELECT u.id, u.email, u.name, u.role, u.department_id, d.name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.email = ?
        ''', (email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": user[0],
            "email": user[1], 
            "name": user[2],
            "role": user[3],
            "department_id": user[4],
            "department_name": user[5]
        }
    finally:
        conn.close()

# Additional endpoints for dashboard functionality
@app.get("/api/achievements/stats/my")
async def get_my_stats(email: str = Depends(verify_token)):
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    try:
        # Get user info
        cursor.execute('SELECT id, department_id FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id, department_id = user
        
        # Get user's achievement stats
        cursor.execute('''
            SELECT 
                COUNT(*) as total_count,
                COALESCE(SUM(points), 0) as total_points,
                COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_count
            FROM achievements 
            WHERE user_id = ?
        ''', (user_id,))
        
        stats = cursor.fetchone()
        
        return {
            "total_count": stats[0] if stats else 0,
            "total_points": stats[1] if stats else 0,
            "featured_count": stats[2] if stats else 0,
            "recent_count": stats[0] if stats else 0  # For now, same as total
        }
    
    finally:
        conn.close()

@app.get("/api/achievements")
async def get_achievements(email: str = Depends(verify_token), limit: int = 10, department_only: bool = True):
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    try:
        # Get user info
        cursor.execute('SELECT id, department_id, role FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id, department_id, role = user
        
        # Admins can see all achievements, others see department-scoped
        if role == 'admin' and not department_only:
            cursor.execute('''
                SELECT a.id, a.title, a.description, a.points, a.is_featured, a.created_at,
                       u.name as user_name, d.name as department_name
                FROM achievements a
                JOIN users u ON a.user_id = u.id
                JOIN departments d ON a.department_id = d.id
                ORDER BY a.created_at DESC
                LIMIT ?
            ''', (limit,))
        else:
            cursor.execute('''
                SELECT a.id, a.title, a.description, a.points, a.is_featured, a.created_at,
                       u.name as user_name, d.name as department_name
                FROM achievements a
                JOIN users u ON a.user_id = u.id
                JOIN departments d ON a.department_id = d.id
                WHERE a.department_id = ?
                ORDER BY a.created_at DESC
                LIMIT ?
            ''', (department_id, limit))
        
        achievements = cursor.fetchall()
        
        return [
            {
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "points": row[3],
                "is_featured": bool(row[4]),
                "created_at": row[5],
                "user_name": row[6],
                "department_name": row[7]
            }
            for row in achievements
        ]
    
    finally:
        conn.close()

@app.get("/api/achievements/leaderboard/department/{department_id}")
async def get_department_leaderboard(department_id: int, email: str = Depends(verify_token), limit: int = 5):
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    try:
        # Get requesting user info
        cursor.execute('SELECT id, department_id, role FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id, user_dept_id, role = user
        
        # Check access: users can only see their department unless admin
        if role != 'admin' and user_dept_id != department_id:
            raise HTTPException(status_code=403, detail="Access denied to this department")
        
        # Get leaderboard for the department
        cursor.execute('''
            SELECT u.id, u.name, u.email, u.role,
                   COALESCE(SUM(a.points), 0) as total_points,
                   COUNT(a.id) as achievement_count
            FROM users u
            LEFT JOIN achievements a ON u.id = a.user_id
            WHERE u.department_id = ?
            GROUP BY u.id, u.name, u.email, u.role
            ORDER BY total_points DESC, achievement_count DESC
            LIMIT ?
        ''', (department_id, limit))
        
        leaderboard = cursor.fetchall()
        
        return [
            {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "role": row[3],
                "total_points": row[4],
                "achievement_count": row[5]
            }
            for row in leaderboard
        ]
    
    finally:
        conn.close()

# Department endpoints
@app.get("/api/departments")
async def get_departments(email: str = Depends(verify_token)):
    conn = sqlite3.connect('bragboard.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id, name, description FROM departments ORDER BY name')
        departments = cursor.fetchall()
        
        return [
            {
                "id": row[0],
                "name": row[1],
                "description": row[2]
            }
            for row in departments
        ]
    
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)