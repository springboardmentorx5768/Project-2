# BragBoard - Employee Recognition Platform

## 📋 Project Overview
BragBoard is a full-stack web application for employee shout-outs and recognition. Employees can give and receive appreciation, react to posts, add comments, and track team achievements.

---

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **Alembic** - Database migrations

### Frontend
- **React 19.1** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling

---

## ⚡ Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL

### Backend Setup
```bash
cd Backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
Backend runs on: http://127.0.0.1:8000

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5174

### Database Setup
1. Create PostgreSQL database
2. Update `.env` file with database credentials
3. Run migrations:
```bash
python -m alembic upgrade head
```

---

## 🎯 Core Features

### Week 1-4 Features
- ✅ User Authentication (Login/Register)
- ✅ Create & View Shoutouts
- ✅ Department Filtering
- ✅ Statistics Dashboard
- ✅ Leaderboard (Top Givers/Receivers)
- ✅ Activity Logs
- ✅ Image Upload
- ✅ Admin Dashboard

### Week 5 Features (NEW)
- ✅ **Reactions** - Like 👍, Clap 👏, Star ⭐ buttons
- ✅ **Comments** - Add comments with @ mentions
- ✅ **Delete Account** - Self-service account deletion
- ✅ **Department Activity** - View department-specific activity

---

## 📊 Database Schema

### Tables
1. **users** - User accounts and profiles
2. **shoutouts** - Recognition posts
3. **reactions** - Likes, claps, stars on shoutouts
4. **comments** - Comments on shoutouts
5. **activity_logs** - System activity tracking

### Relationships
- Users can give/receive multiple shoutouts
- Shoutouts can have multiple reactions and comments
- One reaction per user per shoutout (unique constraint)

---

## 🔐 Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access (Employee/Admin)
- Protected API endpoints

---

## 📱 User Interface

### Main Views
1. **Dashboard** - Statistics and overview
2. **Shoutout Feed** - All shoutouts with filters
3. **My Shoutouts** - Given and received
4. **Leaderboard** - Top contributors
5. **Analytics** - Charts and insights
6. **Activity Log** - Recent actions
7. **Department Activity** - Department-specific view

### Key Components
- Create shoutout form with image upload
- Reaction buttons (Like/Clap/Star)
- Comments section with @ mentions
- Department filters
- Search and sort options
- Account dropdown with delete option

---

## 🚀 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login

### Shoutouts
- `POST /shoutouts` - Create shoutout
- `GET /shoutouts/feed` - Get shoutouts
- `GET /shoutouts/my-stats` - User statistics
- `DELETE /shoutouts/{id}` - Delete shoutout

### Reactions (Week 5)
- `POST /reactions/` - Add reaction
- `DELETE /reactions/{id}` - Remove reaction
- `GET /reactions/{shoutout_id}/summary` - Get counts

### Comments (Week 5)
- `POST /comments/` - Add comment
- `GET /comments/{shoutout_id}` - Get comments
- `DELETE /comments/{id}` - Delete comment

### Users
- `GET /users/me` - Current user profile
- `DELETE /users/me/delete` - Delete own account
- `GET /users/list` - Search users

---

## 📁 Project Structure

```
Sreeja_BragBoard/
├── Backend/
│   ├── main.py                  # Entry point
│   ├── models.py                # Database models
│   ├── auth.py                  # JWT authentication
│   ├── routers/
│   │   ├── shoutouts.py
│   │   ├── users.py
│   │   ├── reactions.py         # Week 5
│   │   ├── comments.py          # Week 5
│   │   └── activity.py
│   └── alembic/                 # Migrations
├── Frontend/
│   └── src/
│       ├── components/
│       │   ├── Dashboard.jsx
│       │   ├── MainContent.jsx
│       │   ├── ReactionButtons.jsx  # Week 5
│       │   └── Comments.jsx         # Week 5
│       └── services/
│           └── api.js
└── screenshots/                 # Optional screenshots
```

---

## 🎨 Features Highlights

### Reactions System
- Three reaction types: Like, Clap, Star
- Real-time count updates
- One reaction per user per shoutout
- Active state highlighting
- Hover tooltips

### Comments System
- Multi-line comments
- @ mention hints
- User avatars and names
- Timestamp display
- Delete permissions (owner or admin)
- Collapsible sections

### Department Activity
- Clickable departments in sidebar
- Filtered shoutouts by department
- Full date/time display
- Relative time ("2 days ago")
- Integrated reactions and comments

### Account Management
- Delete own account option
- Confirmation modal
- Automatic data cleanup (CASCADE)
- Activity logging

---

## 🔧 Configuration

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
ENVIRONMENT=development
```

### Frontend (vite.config.js)
```javascript
export default defineConfig({
  server: {
    port: 5174
  }
})
```

---

## 👥 User Roles

### Employee
- Create shoutouts
- React to posts
- Add comments
- View statistics
- Delete own account

### Admin
- All employee features
- Delete any shoutout
- Delete any comment
- Manage users
- View all activity logs

---

## 📈 Statistics Tracked
- Total Shoutouts (system-wide)
- Shoutouts Given (by user)
- Shoutouts Received (by user)
- Reaction counts per shoutout
- Comment counts per shoutout
- Top givers and receivers

---

## 🔒 Security Features
- Password hashing (bcrypt)
- JWT authentication
- Protected routes
- Input validation
- SQL injection prevention (ORM)
- CORS configuration
- Role-based access control

---

## 🧪 Testing

### Test Users (Default)
- `a@gmail.com` / password: `a`
- `b@gmail.com` / password: `b`
- `c@gmail.com` / password: `c`
- `s@gmail.com` / password: `s`

### Test Scripts
```bash
cd Backend
python check_users.py          # Verify users
python test_login.py           # Test authentication
python create_test_shoutouts.py # Create test data
```

---

## 📝 Development Notes

### Database Migrations
```bash
# Create migration
python -m alembic revision -m "description"

# Run migrations
python -m alembic upgrade head

# Rollback
python -m alembic downgrade -1
```

### Running Servers
```bash
# Backend
cd Backend
python -m uvicorn main:app --reload

# Frontend
cd Frontend
npm run dev
```

---

## 🎯 Week 5 Implementation Details

### 1. Reactions Feature
- **Backend**: New Reaction model, reactions router, migration
- **Frontend**: ReactionButtons component, API integration
- **Database**: reactions table with unique constraint

### 2. Comments Feature
- **Backend**: New Comment model, comments router, migration
- **Frontend**: Comments component with collapsible UI
- **Database**: comments table with CASCADE delete

### 3. Delete Account
- **Backend**: DELETE /users/me/delete endpoint
- **Frontend**: Dropdown menu with confirmation modal
- **Security**: Automatic CASCADE delete of user data

### 4. Department Activity
- **Backend**: Enhanced department filtering
- **Frontend**: Clickable departments, dedicated view
- **UI**: Full timestamps and relative time display

---

## 🏆 Project Statistics
- **Development Time**: 5-7 weeks
- **Lines of Code**: 6,500+
- **Components**: 27 React components
- **API Endpoints**: 30+
- **Database Tables**: 5
- **Migrations**: 5+

---

## 📦 Deployment
- Backend: Deploy to Heroku, AWS, or DigitalOcean
- Frontend: Deploy to Vercel, Netlify, or AWS S3
- Database: PostgreSQL on Heroku, AWS RDS, or similar

---

## 📞 Support
For issues or questions, refer to:
- `PROJECT_DOCUMENTATION.md` - Detailed technical documentation
- `PROJECT_STRUCTURE.md` - Project structure overview
- `POSTGRESQL_SETUP.md` - Database setup guide

---

## ✅ Completion Checklist
- ✅ Authentication system
- ✅ Shoutout CRUD operations
- ✅ Statistics and leaderboard
- ✅ Image upload
- ✅ Reactions system (Week 5)
- ✅ Comments system (Week 5)
- ✅ Delete account (Week 5)
- ✅ Department activity (Week 5)
- ✅ Admin features
- ✅ Activity logging

---

**BragBoard - Celebrate Team Success! 🎉**
