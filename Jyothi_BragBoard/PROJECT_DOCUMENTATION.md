**BragBoard Project – Week 1 & Week 2 Documentation**<br><br>
**Project Overview**<br><br>
BragBoard is an internal recognition tool that enables employees to appreciate their colleagues by posting shout-outs.
It promotes a positive workplace culture by allowing tagging, commenting, and visible appreciation across the organization.Admins can oversee activities, track engagement, and moderate flagged content.<br><br>

**Project Definition**<br>
BragBoard is a full-stack web application that connects employees within a company through recognition posts.<br><br>

**It supports:**<br>
-Employee login and authentication<br>
-Posting and viewing shout-outs<br>
-Department-wise visibility<br>
-Admin-level moderation and analytics (future scope)<br><br>

**🛠️ Technology Stack**<br><br>
**Frontend**<br>
-React.js (with Vite) – For building dynamic user interfaces<br>
-Tailwind CSS – For responsive and modern UI design<br>
-JavaScript (ES6+) – For frontend logic<br>
-React Router – For navigation between pages<br><br>
**Backend**<br>
-FastAPI – For developing high-performance REST APIs<br>
-SQLAlchemy – For database ORM and model management<br>
-PostgreSQL – For persistent and relational data storage<br>
-Uvicorn – ASGI server for running FastAPI<br><br>
**Security & Authentication**<br>
-JWT (JSON Web Tokens) – For secure authentication<br>
-bcrypt – For password hashing<br>
-python-jose & passlib – For encryption and token management<br><br>
**📁 Project Structure**
```
BragBoard/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── models.py            # Database models
│   ├── auth.py              # Authentication and JWT logic
│   ├── database.py          # DB configuration (PostgreSQL)
│   ├── routers/             # API endpoints
│   │   └── users.py
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx        # login form component
│   │   │   ├── Register.jsx     # register form component
│   │   │   ├── Dashboard.jsx    # dashboard form component
│   │   │   ├── Header.jsx       # Header layout component
│   │   │   ├── Sidebar.jsx      # Sidebar layout component
│   │   │   └── MainContent.jsx  # Main content area component
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── services/
│   │       └── api.js
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .gitignore                
└── PROJECT_DOCUMENTATION.md
```

**Week 1 – Project Setup & Authentication**<br><br>

**Tasks Completed**<br><br>
-Set up project structure (React + FastAPI)<br>
-Created database models for users<br>
-Implemented user registration and login using JWT<br><br>

**Implementation Details**<br>
-Initialized separate folders for frontend and backend<br>
-Configured PostgreSQL and database connection using SQLAlchemy<br>
-Created User model with fields:<br>
id, name, email, password, department, role, joined_at
-Built authentication system:<br>
POST /register → New user registration<br>
POST /login → User authentication and JWT generation<br>
-Added password hashing (bcrypt)<br>
-Implemented access control with JWT-based token verification<br><br>

**Output**<br>
-Working authentication flow<br>
-User data stored securely in PostgreSQL<br>
-Login generates a valid JWT token<br><br>

**Week 2 – UI Layout & Department Scoping**<br><br>

**Tasks Completed**<br>
-Built basic layout using Tailwind CSS<br>
-Displayed user dashboard after login<br>
-Implemented department-wise scoping in backend<br><br>

**Implementation Details**<br>
-Designed UI using Tailwind CSS for responsive, modern look<br>
-Created React components:<br>
    * Login.jsx – User login form<br>
    * Register.jsx – New user registration<br>
    * Dashboard.jsx – Displays data after successful login<br>
    * Header, MainContent, Sidebar – Layout structure<br>
-Integrated frontend with backend APIs for authentication<br>
-Displayed user information dynamically on dashboard<br>
-Added department-wise data filtering based on user’s department field<br><br>
**Output**<br>
-Users can log in and see dashboard view<br>
-Layout styled with Tailwind CSS<br>
-Department-specific content visible for each user<br>