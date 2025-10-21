# 🏋️ Gym Management System 

## Project Description
This project is a full-stack web application designed for a Gym Management System. It features secure user authentication with role-based access control ('admin' vs. 'member'), a modern responsive interface, and foundational features for managing members and user engagement. This was developed as part of the Infosys Springboard Internship.

---
## 🛠️ Technology Stack

### Frontend Technologies
* **React.js**: A modern JavaScript library for building the user interface.
* **React Router**: For client-side routing and page navigation.
* **Material-UI (MUI)**: Used for professional, pre-built form components.
* **Tailwind CSS**: A utility-first CSS framework for the main dashboard layout.
* **Axios**: For making HTTP requests from the frontend to the backend API.

### Backend Technologies
* **FastAPI**: A high-performance Python framework for building the API.
* **SQLAlchemy**: A Python SQL toolkit and ORM for database interaction.
* **SQLite**: A lightweight, file-based database used for development.
* **Uvicorn**: An ASGI server for running the FastAPI application.

### Security & Authentication
* **JWT (JSON Web Tokens)**: Used for secure, token-based user sessions.
* **bcrypt**: A strong password-hashing algorithm to securely store passwords.
* **PyJWT**: The library used for encoding and decoding JWTs.

---
## 🏗️ Development Process & Implementation

### Phase 1: Foundation & User Authentication (Week 1)
* **Project Setup:** The project was structured with two separate directories: `backend` for FastAPI and `frontend` for React, with a proper `.gitignore` to exclude unnecessary files.
* **Database & API:** A `User` model was created using SQLAlchemy. Secure API endpoints for user registration (`/users/`) and login (`/token`) were built. This included password hashing and JWT generation.
* **Frontend UI (Auth):** The initial Login and Register pages were built using React and Material-UI for a clean user experience with a professional background.

### Phase 2: Dashboard & Department Scoping (Week 2)
* **Dashboard Layout:** A new professional dashboard layout was built using **Tailwind CSS**, featuring a sidebar with icons, a header, and a modern main content area.
* **Protected Routes:** The dashboard was made a "protected route," ensuring only logged-in users can access it.
* **Department-wise Scoping:** This was the key security feature. A `role` ('admin' or 'member') was added to the User model. An admin-only API endpoint (`GET /users/`) was created. The "Members" page on the frontend uses this to correctly show the full member list to an 'admin' and a "permission denied" error to a normal 'member'.

### Phase 3: "Shout-out" & Engagement Feature (Week 3)
* **Backend Expansion:** The backend was updated to support the new "Shout-out" feature.
    * New database tables for `Shoutout` and `Comment` were created in `models.py`.
    * New API endpoints were built to create shout-outs (`POST /shoutouts/`), get all shout-outs (`GET /shoutouts/`), add comments, and handle optional file uploads (`POST /uploadfile/`).
* **Frontend Implementation:** A new "Shout-outs" page was created in React.
    * This page features a form where a logged-in user can write a message, tag other users, and optionally upload an image.
    * It also displays a live feed of all recent shout-outs, showing the message, author, tagged users, any uploaded images, and their comments.

---
## 🔧 Technical Features Implemented
* **Full User Authentication System** with secure registration and JWT login.
* **Role-Based Access Control (RBAC)** with different permissions for 'admin' and 'member' roles.
* **Full-Stack CRUD Functionality** for "Brag Board" and "Shout-out" features.
* **Modern & Responsive UI** using both Material-UI (for forms) and Tailwind CSS (for layout).
* **File Uploads** for images and other attachments in shout-outs.
* **Commenting System** for user engagement on shout-outs.

---
## 📚 Learning Outcomes
* **Full-Stack Integration:** Gained end-to-end experience building features from the database schema to the final user interface.
* **Systematic Debugging:** Learned to use backend terminal tracebacks and browser Developer Tools (Console, Network tabs) to diagnose and fix a wide range of bugs.
* **Security Implementation:** Acquired practical skills in implementing security features like password hashing, protected routes, and role-based permissions.
* **Version Control with Git:** Gained experience with the complete Git workflow, from resolving errors to pushing to a shared remote repository.