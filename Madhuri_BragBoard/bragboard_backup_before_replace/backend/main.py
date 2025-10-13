from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, users, departments, achievements
from app.core.database import engine
from app.models import user

# Create database tables
user.Base.metadata.create_all(bind=engine)

# Create test users using direct SQL for compatibility
def create_test_users_simple():
    import sqlite3
    import bcrypt
    
    try:
        conn = sqlite3.connect('bragboard.db')
        cursor = conn.cursor()
        
        # Create simple users table compatible with old schema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'employee',
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Check if users exist
        cursor.execute('SELECT COUNT(*) FROM users')
        count = cursor.fetchone()[0]
        
        if count == 0:
            # Hash password
            password = "password123"
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
            
            # Insert test users
            cursor.execute('''
                INSERT INTO users (email, password, name, role)
                VALUES (?, ?, ?, ?)
            ''', ('22a31a4424@gmail.com', hashed_password.decode('utf-8'), 'Puppa User', 'admin'))
            
            cursor.execute('''
                INSERT INTO users (email, password, name, role)
                VALUES (?, ?, ?, ?)
            ''', ('test@test.com', hashed_password.decode('utf-8'), 'Test User', 'employee'))
            
            conn.commit()
            print("✅ Created test users:")
            print("   22a31a4424@gmail.com / password123 (admin)")
            print("   test@test.com / password123 (employee)")
        else:
            print(f"Database already has {count} users")
            
        conn.close()
        
    except Exception as e:
        print(f"Error creating simple users: {e}")

# Create test users
create_test_users_simple()

app = FastAPI(
    title="BragBoard API", 
    version="2.0.0",
    description="Employee Achievement and Recognition Platform"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176"
    ],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(departments.router, prefix="/api/departments", tags=["departments"])
app.include_router(achievements.router, prefix="/api/achievements", tags=["achievements"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to BragBoard API",
        "version": "2.0.0",
        "docs": "/docs",
        "features": [
            "User Authentication & Authorization",
            "Department Management",
            "Achievement Tracking",
            "Role-based Access Control",
            "Department-scoped Data"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "bragboard-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)