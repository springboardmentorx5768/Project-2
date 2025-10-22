# config.py
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "postgresql"
DB_USER = "braguser"
DB_PASSWORD = "new"

SQLALCHEMY_DATABASE_URI = (
    f"postgresql://braguser:new@localhost:5432/bragdboard"
)
