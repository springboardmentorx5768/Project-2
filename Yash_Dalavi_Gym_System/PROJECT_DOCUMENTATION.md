Gym Management System - Complete Documentation Report
Project Description
    This project is a full-stack web application designed for a Gym Management System. It features secure user authentication with role-based access control ('admin' vs. 'member'), a modern responsive interface, and foundational features for managing gym-related data. This was developed as part of the Infosys Springboard Internship.

🛠️ Technology Stack
Frontend Technologies
    1.	React.js: A modern JavaScript library for building user interfaces.
    2.	React Router: For client-side routing and page navigation.
    3.	Material-UI (MUI): For professional, pre-built UI components.
    4.	Tailwind CSS: A utility-first CSS framework for custom styling and layouts.
    5.	Axios: For making HTTP requests to the backend API.

Backend Technologies
    1.	FastAPI: A modern, high-performance Python web framework for building APIs.
    2.	SQLAlchemy: A Python SQL toolkit and Object-Relational Mapper (ORM).
    3.	SQLite: A lightweight, file-based database used for development.
    4.	Uvicorn: An ASGI server for running FastAPI.
    5.	Pydantic: For data validation using Python type hints.

Security & Authentication
    1.	JWT (JSON Web Tokens): For secure, token-based user sessions.
    2.	bcrypt: A strong password-hashing algorithm.
    3.	PyJWT: The library used for encoding and decoding JWTs.

🏗️ Development Process & Implementation
Phase 1: Foundation & User Authentication (Week 1)
    1.	Project Setup: The project was structured with two separate directories: backend (for FastAPI) and frontend (for React). A Python virtual environment was created for the backend.
    2.	Database Architecture: A User model was defined using SQLAlchemy, creating a users table with fields for id, email, hashed_password, and role.
    3.	Authentication API: Two main RESTful endpoints were built:
    4.	POST /users/: For new user registration with secure password hashing.
    5.	POST /token: For user login, which returns a JWT access token upon success.

6.	Frontend UI (Auth): The initial UI was built using React and Material-UI to create responsive Login and Register pages. React Router was set up for navigation.

Phase 2: Dashboard & Department Scoping (Week 2)
    1.	Styling Overhaul: The project was migrated to use Tailwind CSS for the main application layout, creating a professional dashboard with a sidebar and content area.

    2.	Department-wise Scoping: This was the key security feature.

        •	Backend Logic: An admin-only API endpoint (GET /users/) was created. This endpoint checks the role from the user's JWT. If the role is not 'admin', it returns a "permission denied" error.

        •	Frontend Implementation: A "Members" page was built that calls this endpoint. The page correctly displays the full member list to an 'admin' and shows an error message to a normal 'member', successfully demonstrating role-based access.

    3.	"Brag Board" Feature: Based on manager feedback, a full-stack "Brag Board" feature was implemented, allowing logged-in users to create and view their own project entries.

🔧 Technical Features Implemented
    •	Full User Authentication System: Secure registration and JWT-based login.
    •	Role-Based Access Control (RBAC): A clear distinction between 'admin' and 'member' roles, where admins have elevated privileges to view all user data.
    •	Protected Routes: Both the backend API and frontend pages are protected, ensuring only logged-in users can access the dashboard.
    •	Modern UI/UX: A responsive, professional design using a combination of Material-UI (for forms) and Tailwind CSS (for layout).
    •	Full-Stack CRUD: The "Brag Board" feature demonstrates full Create, Read, Update, Delete functionality, connecting the React frontend to the FastAPI backend.

📚 Learning Outcomes
    •	Full-Stack Integration: Gained a deep understanding of how a decoupled frontend and backend communicate via a REST API.
    •	Systematic Debugging: Learned to use backend terminal tracebacks and browser Developer Tools (Console, Network tabs) to diagnose and fix complex bugs.
    •	Security Implementation: Acquired hands-on experience with fundamental security practices like password hashing (bcrypt) and token-based authentication (JWT).
    •	Version Control: Learned the basics of using Git for version control.

