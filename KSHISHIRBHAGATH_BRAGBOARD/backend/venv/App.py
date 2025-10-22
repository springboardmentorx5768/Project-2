from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import SQLALCHEMY_DATABASE_URI

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
db = SQLAlchemy(app)

# Example model (users table)
class User(db.Model):
    __tablename__ = "users"  # make sure this matches your DB table
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    name = db.Column(db.String(100))
    role = db.Column(db.String(50))

@app.route("/")
def home():
    return "✅ Flask is running!"

@app.route("/test-db")
def test_db():
    try:
        db.session.execute("SELECT 1")
        return "✅ Database connected!"
    except Exception as e:
        return f"❌ Database error: {e}"

if __name__ == "__main__":
    app.run(debug=True)
