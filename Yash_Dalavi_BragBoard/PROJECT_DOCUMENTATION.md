# 🧩 BragBoard: A Full Stack Web Application

## 📖 Project Description
**BragBoard** is a full-stack web application designed to enhance employee engagement by allowing users to post “shout-outs” to appreciate and recognize their peers.  
It includes secure user authentication, department-wise access control, and a modern responsive user interface.  
This project was developed as part of the **Infosys Springboard Internship Program**.

---

## 🛠️ Technology Stack

### Frontend Technologies
- **React.js** – For building a dynamic and interactive user interface.  
- **React Router** – For smooth client-side routing between pages.  
- **Material-UI (MUI)** – Used for professional and pre-built UI components such as forms and buttons.  
- **Tailwind CSS** – For a responsive, modern dashboard layout.  
- **Axios** – For making API calls to the backend.

### Backend Technologies
- **FastAPI** – A high-performance Python framework for building APIs.  
- **SQLAlchemy** – Used for database ORM and model definitions.  
- **SQLite** – A lightweight and file-based database used for development.  
- **Uvicorn** – ASGI server for running the FastAPI app.

### Security & Authentication
- **JWT (JSON Web Tokens)** – For secure, token-based authentication.  
- **bcrypt** – For strong password hashing.  
- **PyJWT** – For encoding and decoding JWT tokens.

---

## 🏗️ Development Process & Implementation

### Phase 1: Foundation & User Authentication (Week 1)
- **Project Setup:**  
  The project was organized into two main folders — `backend` (FastAPI) and `frontend` (React). Proper Git management and `.gitignore` were maintained.  

- **Database & API:**  
  A `User` model was created using SQLAlchemy. Secure APIs were developed for user registration (`/users/`) and login (`/token`), implementing password hashing and JWT-based authentication.  

- **Frontend (Auth):**  
  Login and Register pages were built using React and Material-UI, offering a clean and professional design.

---

### Phase 2: Dashboard & Department Scoping (Week 2)
- **Dashboard Layout:**  
  A modern dashboard interface was designed using Tailwind CSS with a sidebar, header, and main content area.  

- **Protected Routes:**  
  Only logged-in users can access the dashboard.  

- **Department-wise Scoping:**  
  Role-based access control was implemented with two roles — `admin` and `member`.  
  Admins can view all users, while members see restricted data.  
  The “Members” page dynamically updates based on user role.

---

### Phase 3: Shout-out & Engagement Feature (Week 3)
- **Backend Expansion:**  
  New database tables (`Shoutout` and `Comment`) were added to store user shout-outs and comments.  
  API endpoints were developed for creating shout-outs (`POST /shoutouts/`), fetching all shout-outs (`GET /shoutouts/`), adding comments, and handling optional file uploads (`POST /uploadfile/`).  

- **Frontend Implementation:**  
  A new **Shout-outs** page was created.  
  Users can post a message, tag teammates, and optionally upload images.  
  The page also displays all recent shout-outs along with author details, tagged users, and attachments.

---

### Phase 4: Shout-out Feed, Filters & Attachments (Week 4)
- **Feed Display:**  
  All shout-outs are now displayed in a unified **feed section** on the dashboard.  
  When a user logs in, the feed shows all shout-outs with sender email, tagged users, message, and any uploaded image.  

- **Filter Feature:**  
  Added smart filtering options by **Department**, **Sender Email**, and **Date**.  
  - On the **frontend**, dropdowns and a date picker were created for easy filtering.  
  - On the **backend**, the `/shoutouts/` API was enhanced to accept multiple query parameters (e.g., `?department=HR&sender=admin@example.com`) to fetch filtered data efficiently.  

- **Attachment / Image Upload (Optional):**  
  Implemented an upload field for images or files when creating a shout-out.  
  Uploaded attachments are now displayed directly beneath the message in the feed.  

- **Errors Faced:**  
  Initially, combined filters didn’t return correct results when two or more filters (like department and date) were applied simultaneously.  

- **How It Was Solved:**  
  The issue was in the query logic — conditions were being connected using an **OR** operator instead of **AND**.  
  After updating the SQLAlchemy filter logic, multiple filters started working together correctly.  

- **Learning Outcomes:**  
  - Learned to handle **multiple query parameters** in FastAPI APIs.  
  - Improved understanding of **frontend-backend integration** using Axios.  
  - Practiced implementing **file uploads** and dynamic image rendering in React.  
  - Strengthened debugging skills while resolving multi-filter logic issues.

---

## 🔧 Technical Features Implemented
- Full **User Authentication System** using JWT and bcrypt.  
- **Role-Based Access Control (RBAC)** for admin and member roles.  
- **Full-Stack CRUD** for shout-outs and comments.  
- **Modern UI/UX** using Tailwind CSS and Material-UI.  
- **File Upload Support** for images in shout-outs.  
- **Dynamic Filtering System** for improved user experience.

---

## 📚 Learning Outcomes
- Gained practical knowledge of **full-stack web development**.  
- Learned how to design **secure APIs** and connect them with React.  
- Understood how to manage **frontend state** and backend data effectively.  
- Improved **problem-solving and debugging** skills.  
- Strengthened understanding of **collaborative development and version control** using Git and GitHub.

---

## 🚀 Final Note
This project helped me understand the real-world workflow of a full-stack web application — from database design and API creation to frontend integration and deployment readiness.
