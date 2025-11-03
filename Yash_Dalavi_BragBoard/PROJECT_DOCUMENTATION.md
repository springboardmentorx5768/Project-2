# 🧩 BragBoard: A Full Stack Web Application

## 📖 Project Description
**BragBoard** is a full-stack web application designed to enhance employee engagement by allowing users to post “shout-outs” to appreciate and recognize their peers.  
It includes secure user authentication, role-based access control, dynamic feed with filters, reactions, and comments.  
This project was developed as part of the **Infosys Springboard Internship Program**.

---

## 🛠️ Technology Stack

### Frontend Technologies
- **React.js** – For building a dynamic and interactive user interface.  
- **React Router** – For smooth client-side routing between pages.  
- **Material-UI (MUI)** – Used for the core professional UI theme, components (Cards, Forms, Buttons), and a consistent color palette.  
- **Tailwind CSS** – For the responsive, modern dashboard layout (sidebar and header).  
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

## 🏗️ Development Process & Implementation (Weeks 1–5)

### Phase 1: Foundation & User Authentication (Week 1)
- **Project Setup:**  
  The project was organized into backend (FastAPI) and frontend (React).  

- **Database & API:**  
  A `User` model was created using SQLAlchemy. Secure APIs were developed for user registration (`/users/`) and login (`/token`), implementing password hashing and JWT.  

- **Frontend (Auth):**  
  Login and Register pages were built using React and Material-UI, offering a clean and professional design.

---

### Phase 2: Dashboard & Role-Based Security (Week 2)
- **Dashboard Layout:**  
  A modern dashboard interface was designed using Tailwind CSS with a dark sidebar, header, and main content area.  

- **Protected Routes:**  
  Implemented client-side (`PrivateRoute`) and server-side checks so only logged-in users can access the dashboard.  

- **Role-Based Access Control (RBAC):**  
  Implemented two roles: `admin` and `member`.  
  - **Admin:** Can access the “Members” page and see all users.  
  - **Member:** Is blocked from the “Members” page with a “permission denied” message.

---

### Phase 3: Shout-out Form & File Upload (Week 3)
- **Backend Expansion:**  
  A new `Shoutout` table was created in the database. API endpoints were built for creating shout-outs (`POST /shoutouts/`) and handling file uploads (`POST /uploadfile/`).  

- **Frontend Implementation:**  
  A dedicated **Shout-outs** page (`/shoutouts`) was created. This page contains a professional Material-UI form for posting a new message, tagging users, and attaching an image.  

- **Errors Faced:**  
  File uploads were not working because the backend was not configured to serve static files.  

- **How It Was Solved:**  
  Used `StaticFiles` in FastAPI (`main.py`) to mount the `/uploads` directory, making images accessible via URL.

---

### Phase 4: Feed Display & Dynamic Filtering (Week 4)
- **Dashboard Feed:**  
  The main **Dashboard** page (`/dashboard`) was built. A new component (`ShoutoutFeed.js`) was created to fetch and display all shout-outs in a feed format using Material-UI Cards.  

- **Dynamic Filters:**  
  The feed page includes filters for **Department** and **Sender Email**.  

- **Backend Logic:**  
  The `GET /shoutouts/` endpoint in `crud.py` was updated to accept query parameters (`department`, `sender_email`) to filter data in the database before sending it.  

- **Errors Faced:**  
  The sidebar was not highlighting the active link, making it confusing to know which page was active.  

- **How It Was Solved:**  
  Fixed routing in `App.js` to separate the form and feed. Updated `Layout.js` to use the `useLocation` hook, which applies an “active” class to the current link.

---

### Phase 5: Reactions & Interactivity (Week 5)
- **Backend:**  
  A new `Reaction` table was created in `models.py`. A `UniqueConstraint` was added so one user can only have one reaction per post.  

- **User-Specific Tracking:**  
  The `GET /shoutouts/` endpoint was upgraded to calculate total counts for each reaction type and also check if the `current_user_id` has reacted. It sends both `reaction_counts` and `current_user_reaction` to the frontend.  

- **Frontend (UI):**  
  A new `ReactionButtons.js` component was created.  
  - Displays live counts for **like**, **clap**, and **star**.  
  - Highlights the button based on the user’s current reaction (e.g., blue for “like”).  

- **UI Polish:**  
  Updated the global MUI theme in `App.js` to an **Indigo color scheme**, improving the visual appeal of buttons, cards, and links.

---

## 🔧 Technical Features Implemented (Up to Week 5)
- Full **User Authentication System** using JWT and bcrypt.  
- **Role-Based Access Control (RBAC)** for admin and member roles.  
- Full-Stack **CRUD** for shout-outs and comments.  
- **Reaction System** (like, clap, star) with counters and user-specific tracking.  
- Modern **UI/UX** using a hybrid of Tailwind CSS (Layout) and Material-UI (Components & Theme).  
- **File Upload Support** for images in shout-outs.  
- **Dynamic Filtering System** for the main feed (by Department, Sender).

---

## 📚 Learning Outcomes (Up to Week 5)
- Gained practical knowledge of **full-stack web development** using React and FastAPI.  
- Learned to design secure, **role-based APIs (RBAC)** and connect them with React.  
- Understood how to manage complex **frontend state** with optimistic UI updates for reactions.  
- Improved **problem-solving and debugging skills**, especially routing, filtering, and UI issues.  
- Practiced **clean project structure** and separation of concerns (e.g., `Shoutout.js` vs `ShoutoutFeed.js`).  

---

## 🚀 Final Note
This project helped me understand the **complete workflow of a real-world full-stack web application** — from database design and API development to frontend integration, authentication, and UI polish.  
It also improved my confidence in working independently and solving real-world bugs efficiently during the **Infosys Springboard Internship Program**.
