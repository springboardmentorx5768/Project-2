**BragBoard Project_Documentation**<br><br>
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
Jyothi_BragBoard/
│
├── backend/                                  
│   ├── main.py                              
│   ├── config.py                             
│   ├── database.py                          
│   ├── database_models.py                 
│   ├── schemas.py                         
│   ├── auth.py                               
│   ├── check_db.py                        
│   │
│   ├── routers/                              
│   │   ├── users.py                       
│   │   └── shoutouts.py                      
│   │
│   ├── uploads/                             
│   │   └── (image files saved here)
│   │
│   ├── requirements.txt                    
│   └── .env                                  
│
│
├── frontend/                               
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                         
│   │   │   │   ├── Auth.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   │
│   │   │   ├── dashboard/                    
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── MainContent.jsx
│   │   │   │   └── DashboardContent.jsx
│   │   │   │
│   │   │   ├── shoutouts/                   
│   │   │   │   ├── ShoutOutFeed.jsx
│   │   │   │   ├── ShoutOutForm.jsx
│   │   │   │   ├── ShoutOutPage.jsx
│   │   │   │   ├── MyShoutOuts.jsx
│   │   │   │   └── EditShoutOut.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js                        
│   │   │
│   │   ├── App.jsx                        
│   │   └── index.css                        
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
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
-Department-specific content visible for each user<br><br>

**Week 3 – Shout-Out Feature Implementation**<br><br>
**Tasks Completed**<br>

-Created a Shout-Out form with recipient selection and user tagging<br>
-Stored shout-outs in the database with tagged users<br>
-Added image upload support for shout-outs<br><br>
**Implementation Details**<br>
-Designed ShoutOutForm.jsx in frontend/src/components/dashboard/:<br>
-Dropdown to select a receiver<br>
-Ability to tag multiple users in a shout-out<br>
-Input for message, category selection, and visibility (public/private/department-only)<br>
-Optional image upload with preview before submission<br>
-Integrated with backend APIs (services/api.js) to store shout-outs and tagged users<br>
-Backend stores shout-out data in -database including:<br>
   *message<br>
   *receiver_id<br>
   *tagged_user_ids<br>
   *category<br>
   *visibility<br>
-Optional image file path in uploads/ folder<br>
-Updated ShoutOutFeed.jsx to display shout-outs dynamically with tagged users and reactions<br><br>
**Output:**<br>
-Users can create shout-outs and tag other employees<br>
-Shout-outs are stored in the database with tagged user information<br>
-Shout-out feed dynamically displays posts, tagged users, and reactions<br>
-Supports image upload for better visual recognition<br><br>

**Week 4 – Shout-Out Feed Enhancements & Filtering**<br><br>
**Tasks Completed**<br>
-Displayed all shout-outs on the main feed<br>
-Implemented filters by department, sender, and date<br>
-Added support for attachments or image uploads in shout-outs (optional)<br><br>
**Implementation Details**<br>
-Enhanced ShoutOutFeed.jsx to fetch and display all shout-outs dynamically from the backend<br>
-Integrated backend endpoint /shoutouts/feed to return all posts along with user and tagged details<br>
-Implemented filter functionality:<br>
-Department filter → allows users to view shout-outs from specific departments or all<br>
-Sender filter → view shout-outs created by specific users<br>
-Date filter → display shout-outs from a selected date range<br>
-Added total shout-out count in the feed section (updates automatically when filters are applied)<br>
-Included timestamps for created and edited posts:<br>
     - created_at shows when a shout-out was posted<br>
     - edited_at updates only when a shout-out is edited<br>
-Optional enhancement: Added support for displaying images or attachments in the shout-out feed<br>
-Improved frontend UI with gradient backgrounds and smooth transitions using Tailwind CSS<br><br>
**Output**<br>
-Feed displays all shout-outs across departments<br>
-Filters allow users to refine view by department, sender, and date<br>
-Total shout-out count updates dynamically with filter selection<br>
-Edited posts show “Edited” timestamp properly<br>
-Attachments/images are visible in the feed for better visual engagement<br><br>

