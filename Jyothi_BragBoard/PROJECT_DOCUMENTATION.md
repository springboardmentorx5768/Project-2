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
│   │   ├── shoutouts.py
│   │   ├── reactions.py
│   │   ├── achievements.py       
│   │   ├── admins.py             
│   │   └── comments.py          
│   │
│   ├── uploads/
│   │   └── (image files saved here)
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │
│   │   │ ├── auth/
│   │   │ │   ├── Auth.jsx
│   │   │ │   ├── Login.jsx
│   │   │ │   └── Register.jsx
│   │   │
│   │   │ ├── dashboard/
│   │   │ │   ├── Dashboard.jsx
│   │   │ │   ├── Header.jsx
│   │   │ │   ├── Sidebar.jsx
│   │   │ │   ├── Settings.jsx
│   │   │ │   ├── MainContent.jsx
│   │   │ │   ├── DashboardContent.jsx
│   │   │ │   ├── Leaderboard.jsx       
│   │   │ │   └── Achievements.jsx      
│   │   │
│   │   │ ├── shoutouts/
│   │   │ │   ├── ShoutOutFeed.jsx
│   │   │ │   ├── ShoutOutForm.jsx
│   │   │ │   ├── ShoutOutPage.jsx
│   │   │ │   ├── MyShoutOuts.jsx
│   │   │ │   ├── EditShoutOut.jsx
│   │   │ │   ├── ReactionBar.jsx        
│   │   │ │   ├── ReportShoutOut.jsx    
│   │   │ │   └── CommentsSection.jsx  
│   │   │
│   │   │ ├── admin/
│   │   │ │   ├── AdminBoard.jsx        
│   │   │ │   └── Reports.jsx           
│   │   │ |
│   │   │ └── services/
│   │   │     └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── index.css
│   │
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

**Week 5 – Reaction Feature Implementation**<br><br>
**Tasks Completed**<br>
-Added reactions to shout-outs (Like 👍, Clap 👏, Star ⭐)<br>
-Implemented reaction counters for each post<br>
-Enabled user-specific reaction tracking (each user can react/unreact)
<br>
-Added popup to view list of users who reacted<br><br>

**Implementation Details**<br><br>
-Added reaction buttons in the shout-out feed UI<br>
-Reactions are stored in the database linked to:<br>
-shoutout_id<br>
-user_id<br>
-reaction_type(like/clap/star)<br>
-Clicking a reaction toggles it (adds if not reacted, removes if already reacted)
<br>
-Reaction counts update instantly after each action<br>
-Clicking on the reaction count opens a popup showing the list of users who reacted<br>
-Popup closes on outside-click or re-click<br><br>

**Output**<br><br>
-Each shout-out now displays total reactions per type<br>
-Users can interact and appreciate posts more meaningfully<br>
-Reaction data is maintained per user, ensuring accurate counts<br><br>

**Week 6 – Commenting System Implementation**<br><br>
**Tasks Completed**<br>
-Added the ability for users to comment on shout-outs<br>
-Created a dedicated comments API with CRUD functionality<br>
-Displayed comments under each shout-out in both Feed and My Shout-Outs<br>
-Included comment counts and show/hide comments toggle<br>
-Designed comment UI with username, avatar initial, and timestamps<br>
-Allowed users to edit/delete only their own comments (admin can delete any)<br><br>

**Implementation Details**<br>
-Created a new Comment model in backend with fields:<br>
id, shoutout_id, user_id, content, created_at, edited_at
-Added routes in /comments:
<br>
• POST → Add comment
• GET → Retrieve comments for a shout-out
• PUT → Edit a comment
• DELETE → Delete a comment
-Joined Comment with User model to display:<br>
username, department, role in the frontend UI
-Built CommentSection.jsx component in frontend to:
<br>
• Fetch comments dynamically
• Render comments inside the expanded area
• Show updated counts immediately after adding or removing a comment
-Added a View Comments (X) toggle to expand/collapse comment list without affecting other shout-out cards
-Ensured UI layout matches existing shout-out card styling<br><br>

**Output**<br>
-Users can now engage in discussions through comments<br>
-Comments are correctly associated with users and shout-outs<br>
-Comment list opens smoothly below each post<br>
-Comment count updates in real-time<br>
-Edit/Delete options show only when allowed (self-comment or admin)<br><br>


**Week 7 – Admin Tools & Analytics**<br><br>
**Tasks Completed**<br>
-Implemented admin dashboard with overall statistics: total users, departments, shout-outs, reactions, reports, and top contributor.<br>
-Created endpoints to fetch top contributors and most tagged users.<br>
-Developed functionality to view, resolve, and manage reported shout-outs.<br>
-Enabled admin deletion of shout-outs along with cascading deletion of comments and reactions, and automatic resolution of related reports.<br>
-Enabled admin deletion of individual comments.<br>
-Added analytics features: top departments by shout-outs and activity trend (shout-outs per day over the last 30 days).<br>
-Built frontend AdminDashboard.jsx to visualize all admin statistics using cards, bar charts, pie charts, and trend charts.<br>
-Developed frontend Reports.jsx to manage reported shout-outs with resolve and delete functionality, including modals to view shoutout details.<br><br>

**Implementation Details**<br><br>
**Backend**<br>
-Created Admin routes under /admin with role-based access (admin_required).<br>
-Top Contributors:<br>
    -Endpoint: GET /top-contributors<br>
    -Returns top 5 users by number of shout-outs sent.<br>
-Most Tagged Users:<br>
     -Endpoint: GET /most-tagged<br>
     -Returns top 5 users by number of times they were tagged.<br>
-Admin Stats:<br>
     -Endpoint: GET /stats<br>
     -Returns total users, departments, shout-outs, reactions, reports, pending/resolved reports, and top contributor.<br>
-Reports Management:<br>
     -Endpoint: GET /reports with optional filter (all, pending, resolved)<br>
     -Endpoint: POST /reports/{report_id}/resolve for resolving reports<br>
     -Endpoint: DELETE /shoutout/{shoutout_id}/admin-delete for deleting a shoutout along with comments, reactions, and resolving related reports<br>
     -Endpoint: DELETE /comment/{comment_id} for deleting comments individually<br>
-Analytics:<br>
     -Endpoint: GET /top-departments returns departments ranked by shout-out counts<br>
     -Endpoint: GET /activity-trend returns shout-out counts per day for the last N days<br><br>

**Frontend**<br>

-AdminDashboard.jsx:<br>
-Fetches all admin statistics on component load using ApiService.<br>
-Displays statistics in StatCards with hover animations.<br>
-Renders Top Departments as a donut chart with a legend.<br>
-Displays Activity Trend as a bar chart for last 30 days.
<br>
-Shows Top Contributors and Most Tagged Users with visual lists and charts.<br>
-Reports.jsx:<br>
-Fetches reported shout-outs with filtering for all, pending, resolved.<br>
-Enables admins to resolve reports and delete shout-outs directly from the UI.<br>
-Displays shoutout details in a modal with creator, receiver, category, message, image, and timestamp.<br>
-Uses toast notifications for success/error feedback on actions.<br><br>

**Output**<br><br>

-Admins can now see a comprehensive dashboard of platform activity.<br>
-Reports management is fully functional with live updates for resolve/delete actions.<br>
-Top contributors and most tagged users are visualized for analytics.<br>
-Department-wise statistics and activity trends provide actionable insights.<br>
-Shout-outs, reactions, and comments can be moderated efficiently, ensuring platform integrity.
UI is fully interactive, responsive, and visually aligned with existing app styling.<br><br>

**Week 8 – Leaderboard & Reports Export**<br><br>
**Tasks Completed**<br>
-Implemented export functionality for reports in both PDF and CSV formats from the admin panel.<br>
-Developed a gamified Leaderboard to display top contributors and most tagged users with interactive charts and rankings.<br>
-Polished frontend components including Achievements, Leaderboard, and Reports to ensure cohesive design, responsive layout, and consistent styling.<br><br>
**Implementation Details**<br><br>
**Backend**<br>
-Reports Export:<br>
Endpoint: GET /reports/shoutouts/csv returns CSV file of all reports.<br>
Endpoint: GET /reports/shoutouts/pdf returns PDF file of all reports.<br>
-Leaderboard:<br>
-Reused /top-contributors and /most-tagged endpoints to fetch user stats.<br>
-Endpoint ensures real-time ranking based on shout-outs sent and received.<br><br>
**Frontend**<br>
-Reports Export:<br>
Added buttons in Reports.jsx to download PDF or CSV directly.<br>
Provided toast notifications for success/error feedback.<br>
-Leaderboard:<br>
Leaderboard.jsx displays top contributors and most tagged users.<br>
Interactive bar and vertical bar charts with responsive layout.<br>
Highlighted top performers visually using color codes and rankings.<br>
-UI Polishing:<br>
-Refined Achievements cards, stat cards, and charts with professional styling, proper spacing, light backgrounds, and consistent typography.<br>
-Removed redundant dashboard components; Achievements and Leaderboard now provide all relevant user stats.<br>
-Verified responsive behavior across desktop and mobile screens.<br><br>

**Output**<br>
-Admins can now export all reports for offline analysis in PDF or CSV format.<br>
-Leaderboard provides a gamified view of top contributors and most tagged users.<br>
-Achievements and Leaderboard components are visually professional, responsive, and intuitive.<br>
-All implemented features are fully tested and functional.<br>
