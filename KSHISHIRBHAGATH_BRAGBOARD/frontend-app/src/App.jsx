import React, { useState, useEffect, useRef } from 'react';

// --- MOCK DATA ---
// NOTE: Avatar updates in the ProfilePage component will update the mockUsers object directly
const mockUsers = {
  'alex@company.com': {
    password: 'password123',
    name: 'Alex Ray',
    email: 'alex@company.com',
    role: 'employee',
    department: 'Engineering',
    avatar: 'https://placehold.co/100x100/7E22CE/FFFFFF/png?text=AR',
    achievements: [
      { id: 1, text: 'Top Performer Q2' },
      { id: 2, text: 'Innovation Award' },
    ],
    score: 1250,
  },
  'jordan@company.com': {
    password: 'password123',
    name: 'Jordan Lee',
    email: 'jordan@company.com',
    role: 'employee',
    department: 'Engineering',
    avatar: 'https://placehold.co/100x100/2563EB/FFFFFF/png?text=JL',
    achievements: [{ id: 1, text: 'Project Milestone Champion' }],
    score: 850,
  },
  'taylor@company.com': {
    password: 'password123',
    name: 'Taylor Quinn',
    email: 'taylor@company.com',
    role: 'admin',
    department: 'HR',
    avatar: 'https://placehold.co/100x100/4F46E5/FFFFFF/png?text=TQ',
    achievements: [],
    score: 0,
  },
  'sarah@company.com': {
    password: 'password123',
    name: 'Sarah Green',
    email: 'sarah@company.com',
    role: 'employee',
    department: 'Marketing',
    avatar: 'https://placehold.co/100x100/10B981/FFFFFF/png?text=SG',
    achievements: [{ id: 1, text: 'Campaign of the Quarter' }],
    score: 980,
  },
};

const mockDepartments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR'];

const mockShoutouts = [
  {
    id: 1,
    from: 'Jordan Lee',
    to: 'Alex Ray',
    department: 'Engineering', // Sender's department
    message:
      'Incredible work on the new feature launch! Your dedication was key to our success.',
    gifUrl: null, // New field for GIF support
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    avatar: 'https://placehold.co/100x100/2563EB/FFFFFF/png?text=JL',
  },
  {
    id: 2,
    from: 'Taylor Quinn',
    to: 'Sarah Green',
    department: 'HR', // Sender's department
    message:
      'Huge props to Sarah for the amazing new ad campaign. The results are already speaking for themselves!',
    gifUrl: 'https://media.giphy.com/media/l41JRsHHjEwB64TqM/giphy.gif', // Example GIF
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    avatar: 'https://placehold.co/100x100/4F46E5/FFFFFF/png?text=TQ',
  },
  {
    id: 3,
    from: 'Alex Ray',
    to: 'Jordan Lee',
    department: 'Engineering', // Sender's department
    message:
      'Thanks for the great leadership and guidance on the project. Really appreciate your support!',
    gifUrl: null,
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    avatar: 'https://placehold.co/100x100/7E22CE/FFFFFF/png?text=AR',
  },
];

// **EDIT 12: MOCK GIF DATA FOR PICKER**
const mockGifs = [
  {
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpwaXlhYWJndTF5d2V5ZHJ4bmlzOGw3ZnR6M3RjczYwcm1rcnJ3ayZlcD12MV9pbnRlcm5hbF9naWZfYXR0ZnM9YmFyZXR0ZXMmY3Q9Zw/l41JRsHHjEwB64TqM/giphy.gif',
    alt: 'Clap',
  },
  {
    url: 'https://media.giphy.com/media/l0HlJgR87tK07D0wU/giphy.gif',
    alt: 'Great Job',
  },
  {
    url: 'https://media.giphy.com/media/d9M0K1K3gD1i/giphy.gif',
    alt: 'High Five',
  },
  {
    url: 'https://media.giphy.com/media/3o7TKEeD0I8D9D8z6g/giphy.gif',
    alt: 'Winning',
  },
  {
    url: 'https://media.giphy.com/media/26FPzF73R7vQd4CqY/giphy.gif',
    alt: 'Success',
  },
  {
    url: 'https://media.giphy.com/media/g9582DNuQkyl2zBopW/giphy.gif',
    alt: 'Thank You',
  },
  {
    url: 'https://media.giphy.com/media/Q8OPrlvSmiPmM/giphy.gif',
    alt: 'Confetti',
  },
];

const allEmployees = Object.values(mockUsers).map((u) => u.name);
const allEmployeesData = Object.values(mockUsers);

// --- UTILITY FUNCTIONS ---
const getEmployeeAvatar = (name) => {
  const user = allEmployeesData.find((u) => u.name === name);
  return user
    ? user.avatar
    : 'https://placehold.co/100x100/94A3B8/FFFFFF/png?text=?';
};

// **EDIT 1: NEW UTILITY TO DISPLAY FULL DATE AND TIME** (Retained)
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  // Example format: 10/25/2025, 7:30 PM
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const timeSince = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

// --- SVG ICONS (Kept as is) ---
const RecognitionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 mr-2"
  >
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
  </svg>
);
const UserIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const LockIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
const BuildingIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const TrophyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-yellow-400"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
);
const ChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 mr-2"
  >
    <path d="M3 3v18h18"></path>
    <path d="m19 9-5 5-4-4-3 3"></path>
  </svg>
);
const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 mr-3"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 mr-3"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.73v.2a2 2 0 0 1-1 1.73l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.07a2 2 0 0 1-1-1.73v-.2a2 2 0 0 1 1-1.73l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const SunIcon = ({ className = 'h-5 w-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = ({ className = 'h-5 w-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const EditIcon = ({ className = 'h-5 w-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);
const ImageIcon = ({ className = 'h-5 w-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);
const KeyIcon = ({ className = 'h-5 w-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 2l-2 2"></path>
    <path d="M14.5 5.5l7 7"></path>
    <path d="M11 10a5 5 0 1 1 5 5"></path>
    <path d="M15 16l-3 3"></path>
    <path d="M10 13l-3 3"></path>
    <path d="M8 8L3 3"></path>
  </svg>
);
const GifIcon = ({ className = 'h-5 w-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M10 8h2v8"></path>
    <path d="M7 8h1v8h-1"></path>
    <path d="M15 8h2v8h-2v-3h2"></path>
  </svg>
);

// **NEW ICON: CHEVRON RIGHT**
const ChevronRight = ({ className = 'h-5 w-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// --- Particle Animation Styles (for Login Page) ---
const ParticleStyles = () => (
  // Tailwind doesn't support complex keyframes, so we use a style tag for the animation and glassmorphism.
  <style>
    {`
      @keyframes moveGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .animated-bg {
        background-image: linear-gradient(45deg, #1e3a8a, #4f46e5, #7c3aed, #9333ea);
        background-size: 400% 400%;
        animation: moveGradient 15s ease infinite;
      }
      
      /* **EDIT 13: GLASSMORHPISM STYLES** */
      .glass-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      }

      /* **NEW: Specific landing page styles for visual interest** */
      .landing-cta {
        background-color: #4f46e5;
        background-image: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        box-shadow: 0 4px 15px 0 rgba(116, 79, 168, 0.75);
      }
      .landing-cta:hover {
        background-image: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      }
    `}
  </style>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  // **UPDATE: Initial page is now 'landing'**
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'dashboard', 'messages', 'profile', 'admin'
  const [currentUser, setCurrentUser] = useState(null); // Will hold user object on login
  const [error, setError] = useState('');
  const [shoutouts, setShoutouts] = useState(mockShoutouts); // Public Posts
  const [apiUrl, setApiUrl] = useState('http://127.0.0.1:8000');

  // --- NEW: Theme State ---
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  // -------------------------

  const handleLogin = (email, password) => {
    const userKey = Object.keys(mockUsers).find(
      (key) => mockUsers[key].email === email
    );
    if (userKey && mockUsers[userKey].password === password) {
      setCurrentUser(mockUsers[userKey]);
      setCurrentPage('dashboard');
      setError('');
    } else {
      setError('Invalid email or password.');
    }
  };

  // **EDIT 14: REGISTER HANDLER UPDATED TO USE EMAIL AS KEY**
  const handleRegister = (email, password, name) => {
    if (mockUsers[email]) {
      setError('User with this email already exists.');
    } else {
      mockUsers[email] = {
        password,
        name,
        email, // Store email explicitly
        role: 'employee',
        department: 'Unassigned',
        avatar: `https://placehold.co/100x100/CCCCCC/FFFFFF/png?text=${name.substring(
          0,
          1
        )}`,
        achievements: [],
        score: 0,
      };
      setCurrentUser(mockUsers[email]);
      setCurrentPage('dashboard');
      setError('');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  // --- NEW HANDLER FOR PUBLIC POSTING (Shoutouts) ---
  const handleNewPublicPost = ({ to, message, gifUrl = null }) => {
    // **EDIT 15: ADD gifUrl PARAMETER**
    const newShoutout = {
      id: Date.now(),
      from: currentUser.name,
      to: to,
      department: currentUser.department, // IMPORTANT: Store sender's department
      message: message,
      gifUrl: gifUrl, // Store GIF URL
      timestamp: new Date().toISOString(),
      avatar: currentUser.avatar,
    };

    setShoutouts((prev) => [newShoutout, ...prev]);
  };
  // -----------------------------------------------------

  const renderPage = () => {
    if (currentPage === 'landing') {
      return <LandingPage onNavigateToLogin={() => setCurrentPage('login')} />;
    }
    if (currentPage === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentPage('register')}
          error={error}
        />
      );
    }
    if (currentPage === 'register') {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={() => setCurrentPage('login')}
          error={error}
        />
      );
    }
    if (currentUser) {
      if (currentPage === 'dashboard') {
        return (
          <Dashboard
            user={currentUser}
            onLogout={handleLogout}
            shoutouts={shoutouts}
            setCurrentPage={setCurrentPage}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
      }
      if (currentPage === 'messages') {
        return (
          <PublicPostPage
            user={currentUser}
            setCurrentPage={setCurrentPage}
            shoutouts={shoutouts}
            handleNewPost={handleNewPublicPost}
            theme={theme}
          />
        );
      }
      if (currentPage === 'profile') {
        return (
          <ProfilePage
            user={currentUser}
            setCurrentUser={setCurrentUser} // **EDIT 16: Pass setCurrentUser for profile updates**
            onLogout={handleLogout} // **EDIT 17: Pass onLogout for password reset mock**
            apiUrl={apiUrl}
            setApiUrl={setApiUrl}
            theme={theme}
            toggleTheme={toggleTheme} // **EDIT 18: Pass toggleTheme for the button**
          />
        );
      }
      if (currentPage === 'analytics' && currentUser.role === 'admin') {
        return (
          <AdminDashboard
            user={currentUser}
            shoutouts={[...shoutouts].sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            )}
            theme={theme}
          />
        ); // Admin's dashboard is reused for now
      }
    }

    // Default back to landing
    return <LandingPage onNavigateToLogin={() => setCurrentPage('login')} />;
  };

  const themeClass = theme === 'dark' ? 'dark' : 'light';
  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';

  return (
    <div
      className={`min-h-screen font-sans ${bgColor} ${textColor} ${themeClass}`}
    >
      <ParticleStyles />
      {renderPage()}
    </div>
  );
}

// ----------------------------------------------------------------------
// --- NEW LANDING PAGE ---
// ----------------------------------------------------------------------
function LandingPage({ onNavigateToLogin }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen animated-bg p-8">
      <div className="text-center text-white p-6 max-w-2xl">
        <div className="flex justify-center items-center mb-6">
          <RecognitionIcon className="text-white h-10 w-10" />
          <h1 className="text-5xl font-extrabold ml-3 tracking-tight">
            Bragboard
          </h1>
        </div>
        <p className="text-2xl font-light mb-8 opacity-90">
          The ultimate platform for peer-to-peer recognition. Celebrate wins,
          share shoutouts, and track your achievements across the company.
        </p>

        <div className="flex justify-center space-x-6">
          <button
            onClick={onNavigateToLogin}
            className="landing-cta text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Get Started
            <ChevronRight className="h-5 w-5 ml-2 inline" />
          </button>
        </div>

        <div className="mt-12 space-y-4">
          <p className="text-lg font-medium opacity-80">
            "Recognition is the greatest motivator."
          </p>
          <div className="flex justify-center space-x-8 text-sm opacity-70">
            <p className="flex items-center">
              <TrophyIcon className="h-5 w-5 mr-1" /> Points & Leaderboards
            </p>
            <p className="flex items-center">
              <GifIcon className="h-5 w-5 mr-1" /> GIF & Emoji Support
            </p>
            <p className="flex items-center">
              <ProfileIcon className="h-5 w-5 mr-1" /> Personal Profile Tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// --- AUTH PAGES (Glassmorphism) ---
// ----------------------------------------------------------------------
const AuthLayout = ({ title, children, isLoginPage = false }) => (
  // **EDIT 19: Use glass-card class and portrait-like aspect for max-w-sm**
  <div
    className={`flex items-center justify-center min-h-screen animated-bg p-4`}
  >
    <div className="w-full max-w-sm glass-card p-8 space-y-6 z-10">
      <div className="text-center">
        <div className="flex justify-center items-center mb-4">
          <RecognitionIcon className="text-white" />
          {/* **EDIT 2: UPDATE APP NAME TO BRAGBOARD** */}
          <h1 className="text-2xl font-bold text-white">Bragboard</h1>
        </div>
        <h2 className="text-3xl font-extrabold text-white">{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

function LoginPage({ onLogin, onNavigateToRegister, error }) {
  const [email, setEmail] = useState('alex@company.com');
  const [password, setPassword] = useState('password123');
  const [department, setDepartment] = useState('Engineering');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  // **EDIT 20: Updated input styles for glassmorphism**
  const inputClass =
    'w-full pl-10 pr-3 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition bg-white/10 text-white placeholder-white/70';
  const buttonClass =
    'w-full bg-white text-indigo-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-300 ease-in-out transform hover:-translate-y-1';

  return (
    <AuthLayout title="Welcome Back!">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-300 text-sm text-center">{error}</p>}
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="relative">
          <BuildingIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            // Note: need to override default select styling for glassmorphism
            className={`appearance-none ${inputClass}`}
          >
            {mockDepartments.slice(1).map((dep) => (
              <option key={dep} value={dep} className="text-gray-800 bg-white">
                {dep} Department
              </option>
            ))}
          </select>
        </div>
        <div>
          <button type="submit" className={buttonClass}>
            Sign In
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-white/80 mt-4">
        Don't have an account?{' '}
        <button
          onClick={onNavigateToRegister}
          className="font-medium text-white hover:text-gray-200"
        >
          Sign up
        </button>
      </p>
    </AuthLayout>
  );
}

function RegisterPage({ onRegister, onNavigateToLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(email, password, name);
  };

  // **EDIT 21: Updated input styles for glassmorphism**
  const inputClass =
    'w-full pl-10 pr-3 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition bg-white/10 text-white placeholder-white/70';
  const buttonClass =
    'w-full bg-white text-indigo-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-300 ease-in-out transform hover:-translate-y-1';

  return (
    <AuthLayout title="Create Your Account">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-300 text-sm text-center">{error}</p>}
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <button type="submit" className={buttonClass}>
            Create Account
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-white/80 mt-4">
        Already have an account?{' '}
        <button
          onClick={onNavigateToLogin}
          className="font-medium text-white hover:text-gray-200"
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}

// ----------------------------------------------------------------------
// --- DASHBOARD & SIDEBAR (Core Layout) ---
// ----------------------------------------------------------------------
function Dashboard({
  user,
  onLogout,
  shoutouts,
  setCurrentPage,
  theme,
  toggleTheme,
}) {
  const sortedShoutouts = [...shoutouts].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  const mainBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';

  return (
    <div className={`flex h-screen ${mainBg}`}>
      <Sidebar
        user={user}
        onLogout={onLogout}
        currentPage="dashboard"
        setCurrentPage={setCurrentPage}
        theme={theme}
      />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {user.role === 'admin' ? (
          <AdminDashboard
            user={user}
            shoutouts={sortedShoutouts}
            theme={theme}
          />
        ) : (
          <EmployeeDashboard
            user={user}
            shoutouts={sortedShoutouts}
            theme={theme}
          />
        )}
      </main>
    </div>
  );
}

// **EDIT 22: REMOVED ThemeToggle from Sidebar**
const Sidebar = ({ user, onLogout, currentPage, setCurrentPage, theme }) => {
  // Theme-dependent classes
  const sidebarBg =
    theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white shadow-lg';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-b';
  const navTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const navHoverBg =
    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const navActiveBg =
    theme === 'dark' ? 'bg-gray-700 text-white' : 'text-gray-900 bg-gray-200';
  const profileText = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const profileSubText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <aside className={`w-64 flex flex-col ${sidebarBg}`}>
      <div className={`flex items-center justify-center p-6 ${borderColor}`}>
        <RecognitionIcon />
        {/* **EDIT 4: UPDATE APP NAME TO BRAGBOARD IN SIDEBAR** */}
        <h1 className="text-xl font-bold ml-2">Bragboard</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem
          title="Dashboard"
          page="dashboard"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          }
          navTextColor={navTextColor}
          navHoverBg={navHoverBg}
          navActiveBg={navActiveBg}
        />
        <NavItem
          title="Post Message"
          page="messages"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            </svg>
          }
          navTextColor={navTextColor}
          navHoverBg={navHoverBg}
          navActiveBg={navActiveBg}
        />
        {user.role === 'admin' && (
          <NavItem
            title="Analytics"
            page="analytics"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<ChartIcon />}
            navTextColor={navTextColor}
            navHoverBg={navHoverBg}
            navActiveBg={navActiveBg}
          />
        )}
        <NavItem
          title="Profile"
          page="profile"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          icon={<ProfileIcon />}
          navTextColor={navTextColor}
          navHoverBg={navHoverBg}
          navActiveBg={navActiveBg}
        />
      </nav>
      <div className={`p-4 ${borderColor}`}>
        <div className="flex items-center">
          <img
            src={user.avatar}
            alt="User Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="ml-3">
            <p className={`font-semibold text-sm ${profileText}`}>
              {user.name}
            </p>
            <p className={`text-xs ${profileSubText}`}>{user.department}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full mt-4 flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <LogoutIcon />
          <span className="ml-2">Logout</span>
        </button>
      </div>
    </aside>
  );
};

// NavItem kept as is
const NavItem = ({
  title,
  page,
  currentPage,
  setCurrentPage,
  icon,
  navTextColor,
  navHoverBg,
  navActiveBg,
}) => (
  <button
    onClick={() => setCurrentPage(page)}
    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors duration-150 ${
      currentPage === page
        ? navActiveBg + ' font-semibold'
        : navTextColor + ' ' + navHoverBg
    }`}
  >
    {icon}
    {title}
  </button>
);

// --- UTILITY COMPONENTS ---
const DashboardHeader = ({ title, subtitle, theme }) => {
  const titleColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const subtitleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  return (
    <div className="mb-8">
      <h1 className={`text-4xl font-bold ${titleColor}`}>{title}</h1>
      <p className={`${subtitleColor} mt-1`}>{subtitle}</p>
    </div>
  );
};

const DashboardCard = ({ children, className = '', theme }) => {
  const cardBg = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const shadow = theme === 'dark' ? 'shadow-xl' : 'shadow-md';
  return (
    <div className={`${cardBg} rounded-2xl ${shadow} p-6 ${className}`}>
      {children}
    </div>
  );
};

// **UPGRADE: Shoutout component updated to display sender's department**
const ShoutoutItem = ({ shoutout, theme }) => {
  const { from, to, message, timestamp, avatar, gifUrl, department } = shoutout;
  const shoutoutBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div
      className={`flex flex-col p-4 ${shoutoutBg} rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex items-start">
        <img
          src={avatar}
          alt={from}
          className="h-10 w-10 rounded-full mr-4 object-cover border-2 border-indigo-400"
        />
        <div className="flex-1">
          {/* NEW: Display Department */}
          <p
            className={`text-xs font-semibold uppercase tracking-wider mb-1 ${subText}`}
          >
            {department}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-indigo-500">{from}</span> gave a
            shoutout to <span className={`font-bold ${textPrimary}`}>{to}</span>
          </p>
          <p className={`${textPrimary} mt-2`}>{message}</p>
          {/* **EDIT 5/11: USE ABSOLUTE DATE/TIME FOR OLD MESSAGES** */}
          <small className={`${subText} block mt-2`}>
            {formatDateTime(timestamp)}
          </small>
        </div>
      </div>
      {/* Display GIF if present */}
      {gifUrl && (
        <div className="mt-3 max-w-xs rounded-lg overflow-hidden border border-indigo-200">
          <img
            src={gifUrl}
            alt="GIF"
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

// --- EMPLOYEE DASHBOARD (Updated to use theme-aware components) ---
function EmployeeDashboard({ user, shoutouts, theme }) {
  // Only shows the 5 most recent shoutouts on the main dashboard feed for simplicity
  const recentFeed = shoutouts.slice(0, 5);

  // Sort employees by score for Leaderboard (descending)
  const leaderboard = allEmployeesData
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Theme-dependent classes
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <>
      <DashboardHeader
        title={`Welcome, ${user.name}!`}
        subtitle="View the latest company shoutouts and your standing."
        theme={theme}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Score Card */}
        <DashboardCard
          className="md:col-span-1 flex flex-col justify-between"
          theme={theme}
        >
          <h3
            className={`text-xl font-bold ${textPrimary} mb-4 flex items-center`}
          >
            <TrophyIcon /> Your Recognition Score
          </h3>
          <div className="text-center my-6">
            <p className="text-6xl font-extrabold text-indigo-500">
              {user.score}
            </p>
            <p className={`${subText} mt-1`}>Total Points</p>
          </div>
          <div
            className={`border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            } pt-4`}
          >
            <h4 className={`font-semibold ${textSecondary} mb-2`}>
              Recent Achievements:
            </h4>
            <ul className={`space-y-1 text-sm ${textSecondary}`}>
              {user.achievements.length > 0 ? (
                user.achievements.map((ach) => (
                  <li key={ach.id} className="flex items-center">
                    <span className="text-indigo-500 mr-2">•</span>
                    {ach.text}
                  </li>
                ))
              ) : (
                <li className="text-gray-400">No achievements yet.</li>
              )}
            </ul>
          </div>
        </DashboardCard>

        {/* Public Shoutout Feed */}
        <DashboardCard className="md:col-span-2" theme={theme}>
          <h3
            className={`text-xl font-bold ${textPrimary} mb-4 border-b ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            } pb-2`}
          >
            Recent Public Shoutouts (Company Feed)
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {recentFeed.length > 0 ? (
              recentFeed.map((shoutout) => (
                <ShoutoutItem
                  key={shoutout.id}
                  shoutout={shoutout}
                  theme={theme}
                />
              ))
            ) : (
              <p className={`text-center ${subText} pt-10`}>
                No public posts yet. Be the first!
              </p>
            )}
          </div>
        </DashboardCard>

        {/* Leaderboard */}
        <DashboardCard className="md:col-span-3" theme={theme}>
          <h3
            className={`text-xl font-bold ${textPrimary} mb-4 border-b ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            } pb-2`}
          >
            Top Performers Leaderboard
          </h3>
          <ul className="space-y-3">
            {leaderboard.map((emp, index) => (
              <li
                key={emp.name}
                className={`flex items-center justify-between p-3 ${
                  theme === 'dark' ? 'bg-indigo-900/50' : 'bg-indigo-50'
                } rounded-lg`}
              >
                <div className="flex items-center">
                  <span
                    className={`text-lg font-bold mr-4 ${
                      index === 0
                        ? 'text-yellow-500'
                        : index === 1
                        ? 'text-gray-400'
                        : index === 2
                        ? 'text-amber-700'
                        : textSecondary
                    }`}
                  >
                    {index + 1}.
                  </span>
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="h-8 w-8 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className={`font-semibold ${textPrimary}`}>{emp.name}</p>
                    <p
                      className={`text-xs ${
                        theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'
                      }`}
                    >
                      {emp.department}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'
                  }`}
                >
                  {emp.score} pts
                </div>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </>
  );
}

// --- ADMIN DASHBOARD (Kept as is, using ShoutoutItem) ---
function AdminDashboard({ user, shoutouts, theme }) {
  // Theme-dependent classes
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <>
      <DashboardHeader
        title={`Admin Panel - Welcome, ${user.name}!`}
        subtitle="Overview of company recognition and analytics."
        theme={theme}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Example Admin Metric Card */}
        <DashboardCard className="md:col-span-1" theme={theme}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>
            Total Shoutouts
          </h3>
          <p className="text-6xl font-extrabold text-green-500">
            {shoutouts.length}
          </p>
          <p className={`${subText} mt-1`}>Since last quarter</p>
        </DashboardCard>

        {/* Admin Feed */}
        <DashboardCard className="md:col-span-2" theme={theme}>
          <h3
            className={`text-xl font-bold ${textPrimary} mb-4 border-b ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            } pb-2`}
          >
            All Public Shoutout Feed
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {shoutouts.map((shoutout) => (
              <ShoutoutItem
                key={shoutout.id}
                shoutout={shoutout}
                theme={theme}
              />
            ))}
            {shoutouts.length === 0 && (
              <p className={`text-center ${subText} pt-10`}>
                No public posts yet.
              </p>
            )}
          </div>
        </DashboardCard>
      </div>
    </>
  );
}

// **EDIT 3: EMOJI PICKER COMPONENT** (Retained)
const EmojiPicker = ({ onSelect, theme }) => {
  const commonEmojis = [
    '👍',
    '👏',
    '🌟',
    '🎉',
    '🔥',
    '💡',
    '🚀',
    '💯',
    '🏆',
    '🥳',
    '🙌',
    '💪',
    '🥇',
    '✨',
  ];

  const bg = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const border = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const hoverBg = theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100';

  return (
    <div
      className={`absolute right-0 bottom-full mb-2 w-48 rounded-lg shadow-xl z-20 p-2 border ${bg} ${border}`}
    >
      <div className="grid grid-cols-5 gap-1">
        {commonEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className={`p-1 text-xl rounded-md transition ${hoverBg}`}
            title={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
// -----------------------------------------------------------

// **EDIT 24: GIF PICKER COMPONENT**
const GifPicker = ({ onSelect, theme, onClose }) => {
  const bg = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const border = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const hoverBorder = 'hover:border-indigo-500';

  return (
    <div
      className={`absolute right-0 bottom-full mb-2 w-72 rounded-xl shadow-xl z-20 p-3 border ${bg} ${border}`}
    >
      <h4
        className={`${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        } font-semibold mb-2`}
      >
        Select a GIF
      </h4>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {mockGifs.map((gif, index) => (
          <img
            key={index}
            src={gif.url}
            alt={gif.alt}
            onClick={() => onSelect(gif.url)}
            className={`w-full h-auto rounded-lg object-cover cursor-pointer border-2 border-transparent transition ${hoverBorder}`}
            loading="lazy"
          />
        ))}
      </div>
      <button
        onClick={onClose}
        className={`w-full mt-3 text-sm py-1 rounded ${
          theme === 'dark'
            ? 'text-gray-300 hover:text-white'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        Cancel
      </button>
    </div>
  );
};
// -----------------------------------------------------------

// ----------------------------------------------------------------------
// --- PUBLIC POST PAGE (Updated with Emoji and GIF Feature) ---
// ----------------------------------------------------------------------
function PublicPostPage({
  user,
  setCurrentPage,
  shoutouts,
  handleNewPost,
  theme,
}) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false); // **EDIT 25: NEW STATE FOR GIF PICKER**
  const [selectedGif, setSelectedGif] = useState(null); // **EDIT 26: NEW STATE FOR SELECTED GIF**
  const [recipient, setRecipient] = useState('All');
  const inputRef = useRef(null);

  const sortedShoutouts = [...shoutouts].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  const recentlyPosted = sortedShoutouts.slice(0, 5);

  // Theme-dependent classes
  const mainBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const postBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const popupBg =
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600'
      : 'bg-white border-gray-200';
  const popupHover =
    theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-indigo-50';
  const textAreaClasses =
    theme === 'dark'
      ? 'bg-gray-700 text-gray-100 border-gray-600 focus:ring-indigo-500'
      : 'bg-white text-gray-800 border-gray-300 focus:ring-indigo-500';
  const buttonActive = 'text-white bg-indigo-600 hover:bg-indigo-700';
  const buttonInactive =
    theme === 'dark'
      ? 'text-gray-300 bg-gray-600 hover:bg-gray-500'
      : 'text-gray-700 bg-gray-200 hover:bg-gray-300';

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setCurrentMessage(value);
    // Close pickers when typing
    setIsEmojiPickerOpen(false);
    setIsGifPickerOpen(false);
    setSelectedGif(null); // Clear selected GIF if user starts typing a new message

    if (value.includes('@') && !value.endsWith(' ')) {
      setShowEmployeeList(true);
    } else {
      setShowEmployeeList(false);
    }
  };

  const handleSelectEmoji = (emoji) => {
    setCurrentMessage((prev) => prev + emoji);
    setIsEmojiPickerOpen(false);
    inputRef.current.focus();
  };

  // **EDIT 27: HANDLER FOR GIF SELECTION**
  const handleSelectGif = (url) => {
    setSelectedGif(url);
    setIsGifPickerOpen(false);
    inputRef.current.focus();
  };
  // ------------------------------------

  const handleSelectEmployee = (employeeName) => {
    const newRecipient = employeeName === 'All' ? 'All' : employeeName;
    setRecipient(newRecipient);

    let newMessage = currentMessage;
    if (newRecipient !== 'All') {
      const lastAt = currentMessage.lastIndexOf('@');
      if (lastAt !== -1) {
        newMessage = currentMessage.substring(0, lastAt) + `@${employeeName} `;
      } else {
        newMessage += `@${employeeName} `;
      }
    }

    setCurrentMessage(newMessage);
    setShowEmployeeList(false);
    inputRef.current.focus();
  };

  const handleSend = () => {
    if (!currentMessage.trim() && !selectedGif) return;

    handleNewPost({
      to: recipient,
      message: currentMessage.trim(),
      gifUrl: selectedGif, // Pass selected GIF URL
    });

    setCurrentMessage('');
    setSelectedGif(null); // Clear GIF after sending
    setRecipient('All');
  };

  return (
    <div className={`flex h-screen ${mainBg}`}>
      <Sidebar
        user={user}
        onLogout={() => setCurrentPage('login')}
        currentPage="messages"
        setCurrentPage={setCurrentPage}
        theme={theme}
      />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <DashboardHeader
          title="Public Recognition & Congratulations"
          subtitle="Post a public message, emoji, or GIF to recognize a colleague's efforts."
          theme={theme}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post/Compose Area */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardCard className="h-full flex flex-col" theme={theme}>
              <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>
                Post to Public Feed
              </h3>

              <div className="mb-4">
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-1`}
                >
                  Recipient:
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setRecipient('All')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      recipient === 'All'
                        ? 'bg-indigo-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Public Post (To All)
                  </button>
                  <div className={`text-sm ${textSecondary}`}>
                    Current Target:{' '}
                    <span className="font-bold text-indigo-500">
                      {recipient}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={currentMessage}
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Write your congratulation or message here... (Type @ to mention an employee)`}
                  className={`w-full p-3 pr-24 rounded-xl resize-none focus:ring-2 ${textAreaClasses}`}
                  rows="5"
                ></textarea>

                {/* Selected GIF Preview */}
                {selectedGif && (
                  <div className="p-3 bg-indigo-500/10 rounded-b-xl border-t border-indigo-500 flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-500 mr-3">
                        GIF Selected:
                      </p>
                      <img
                        src={selectedGif}
                        alt="Selected GIF Preview"
                        className="h-8 w-8 object-cover rounded"
                      />
                    </div>
                    <button
                      onClick={() => setSelectedGif(null)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Employee List Popup */}
                {showEmployeeList && (
                  <div
                    className={`absolute bottom-full left-0 mb-2 w-full max-w-sm rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto ${popupBg}`}
                  >
                    <p
                      className={`p-2 text-sm font-semibold ${subText} border-b ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      Select Employee
                    </p>
                    {allEmployees
                      .filter((name) =>
                        name
                          .toLowerCase()
                          .includes(
                            currentMessage.toLowerCase().split('@').pop().trim()
                          )
                      )
                      .filter((name) => name !== user.name)
                      .map((name) => (
                        <div
                          key={name}
                          onClick={() => handleSelectEmployee(name)}
                          className={`p-2 ${popupHover} cursor-pointer text-sm flex items-center ${textPrimary}`}
                        >
                          <img
                            src={getEmployeeAvatar(name)}
                            alt={name}
                            className="h-6 w-6 rounded-full mr-2"
                          />
                          {name}
                        </div>
                      ))}
                    <div
                      onClick={() => handleSelectEmployee('All')}
                      className={`p-2 ${popupHover} cursor-pointer text-sm font-bold text-indigo-500 border-t ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      All (Public Post)
                    </div>
                  </div>
                )}

                {/* Send Button, Emoji Button, and GIF Button Container */}
                <div className="absolute right-2 bottom-2 flex space-x-2">
                  {/* **EDIT 28: GIF TOGGLE BUTTON** */}
                  <button
                    onClick={() => {
                      setIsGifPickerOpen((prev) => !prev);
                      setIsEmojiPickerOpen(false); // Close other picker
                    }}
                    className={`p-2 rounded-full transition ${
                      isGifPickerOpen ? buttonActive : buttonInactive
                    }`}
                    title="Insert GIF"
                  >
                    <GifIcon />
                  </button>
                  {/* END GIF TOGGLE BUTTON */}

                  {/* **EDIT 9: EMOJI TOGGLE BUTTON** */}
                  <button
                    onClick={() => {
                      setIsEmojiPickerOpen((prev) => !prev);
                      setIsGifPickerOpen(false); // Close other picker
                    }}
                    className={`p-2 rounded-full transition ${
                      isEmojiPickerOpen ? buttonActive : buttonInactive
                    }`}
                    title="Insert Emoji"
                  >
                    😊
                  </button>
                  {/* END EMOJI TOGGLE BUTTON */}

                  <button
                    onClick={handleSend}
                    className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition"
                    title="Send Public Post"
                    disabled={!currentMessage.trim() && !selectedGif}
                  >
                    <SendIcon />
                  </button>
                </div>

                {/* **EDIT 10: EMOJI PICKER POPUP** */}
                {isEmojiPickerOpen && (
                  <EmojiPicker onSelect={handleSelectEmoji} theme={theme} />
                )}
                {/* **EDIT 29: GIF PICKER POPUP** */}
                {isGifPickerOpen && (
                  <GifPicker
                    onSelect={handleSelectGif}
                    theme={theme}
                    onClose={() => setIsGifPickerOpen(false)}
                  />
                )}
              </div>
            </DashboardCard>
          </div>

          {/* Recently Posted Column */}
          <div className="lg:col-span-1 space-y-4">
            <DashboardCard className="h-full" theme={theme}>
              <h3
                className={`text-xl font-bold ${textPrimary} mb-4 border-b ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                } pb-2`}
              >
                Recently Posted
              </h3>
              <ul className="space-y-4">
                {recentlyPosted.map((post) => (
                  <ShoutoutItem key={post.id} shoutout={post} theme={theme} />
                ))}
                {recentlyPosted.length === 0 && (
                  <li className={subText}>No recent public posts.</li>
                )}
              </ul>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
}

// **EDIT 30: Theme Toggle Component for Profile Page**
const ProfileThemeToggle = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';
  const baseClass =
    'h-10 w-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 transform hover:scale-105';
  const lightClass =
    'bg-yellow-400 text-white hover:bg-yellow-500 shadow-yellow-500/50';
  const darkClass =
    'bg-gray-800 text-indigo-400 hover:bg-gray-700 shadow-indigo-500/50';
  const icon = isDark ? (
    <SunIcon className="h-6 w-6" />
  ) : (
    <MoonIcon className="h-6 w-6" />
  );

  return (
    <button
      onClick={toggleTheme}
      className={`${baseClass} ${isDark ? darkClass : lightClass}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {icon}
    </button>
  );
};

// --- PROFILE PAGE (Updated with Editing and Theme Toggle) ---
function ProfilePage({
  user,
  setCurrentUser,
  onLogout,
  apiUrl,
  setApiUrl,
  theme,
  toggleTheme,
}) {
  // Local state for editing profile
  const [editingName, setEditingName] = useState(user.name);
  const [editingEmail, setEditingEmail] = useState(user.email);
  const [editingAvatar, setEditingAvatar] = useState(user.avatar);
  const [isEditing, setIsEditing] = useState(false); // Retained for future/more complex logic, though not directly used in the current mock handlers
  const [newApiUrl, setNewApiUrl] = useState(apiUrl);

  // **UPGRADE: Use a local state object for the mock users to force a re-render in App.jsx**
  // In a real app, this state would not be necessary, as the parent's mockUsers would update an API/DB.
  // Since we are mocking, we need a way to track the mutable mockUsers object changes.
  const [mockStateUsers, setMockStateUsers] = useState(mockUsers);

  const handleUpdateProfile = (field) => {
    // Mock update: In a real app, this would be an API call

    // Find the current user key (email) in mockUsers
    const userKey = Object.keys(mockUsers).find(
      (key) => mockUsers[key].email === user.email // Use user.email as key finder, it's more reliable
    );

    if (!userKey) {
      alert('Error: User not found in mock data for update.');
      return;
    }

    if (field === 'name') {
      mockUsers[userKey].name = editingName;
      setCurrentUser((prev) => ({ ...prev, name: editingName }));
      alert('Name updated successfully (Mock)!');
    } else if (field === 'email') {
      // Simple mock email change logic (dangerous in real world)
      if (mockUsers[editingEmail]) {
        alert('Error: Email already in use in mock data.');
        return;
      }

      const oldUser = mockUsers[userKey];
      delete mockUsers[userKey]; // Delete the old key
      mockUsers[editingEmail] = { ...oldUser, email: editingEmail }; // Create new user with new email as key

      // 2. Update current user state
      setCurrentUser(mockUsers[editingEmail]);
      alert('Email updated and key changed (Mock)!');
    } else if (field === 'avatar') {
      mockUsers[userKey].avatar = editingAvatar;
      setCurrentUser((prev) => ({ ...prev, avatar: editingAvatar }));
      alert('Avatar URL updated successfully (Mock)!');
    }

    // Force an update to the local state to trigger any dependent components if needed (not strictly needed here but good practice in a mock)
    setMockStateUsers({ ...mockUsers });

    // Simulate successful save
    setIsEditing(false);
  };

  const handlePasswordReset = () => {
    // Mock password reset: Log user out and send them to the login page
    onLogout();
    // Use an alert to inform the user about the mock action, as we can't show a true modal here
    alert(
      "Password reset simulated. You have been logged out. Please 'sign up' or 'sign in' with new mock credentials."
    );
  };

  const handleSaveApiUrl = () => {
    setApiUrl(newApiUrl);
    alert('API URL Updated!');
  };

  // Theme-dependent classes
  const mainBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const subCardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const inputClasses =
    theme === 'dark'
      ? 'bg-gray-800 text-gray-100 border-gray-600 focus:ring-indigo-500'
      : 'bg-white text-gray-800 border-gray-300 focus:ring-indigo-500';

  // **EDIT 31: Helper component for editable fields**
  const EditableField = ({
    label,
    value,
    onValueChange,
    onSave,
    icon,
    type = 'text',
  }) => {
    const fieldKey = label.toLowerCase().replace(/\s/g, ''); // e.g., 'Avatar URL' -> 'avatarurl'
    const isDirty =
      value !== user[fieldKey === 'avatarurl' ? 'avatar' : fieldKey]; // Check against the actual user prop key
    const fieldId = `edit-${fieldKey}`;

    return (
      <div className={`p-4 rounded-lg ${subCardBg}`}>
        <label
          htmlFor={fieldId}
          className={`block text-sm font-medium ${textSecondary} mb-1 flex items-center`}
        >
          {icon}
          <span className="ml-2">{label}</span>
        </label>
        <div className="flex space-x-2">
          <input
            id={fieldId}
            type={type}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className={`flex-1 p-2 border rounded-lg focus:ring-2 ${inputClasses}`}
          />
          <button
            onClick={onSave}
            disabled={!isDirty || !value}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              isDirty && value
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-screen ${mainBg}`}>
      <Sidebar
        user={user}
        onLogout={onLogout}
        currentPage="profile"
        setCurrentPage={setCurrentPage}
        theme={theme}
      />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-between items-start">
          <DashboardHeader
            title="My Profile"
            subtitle="Manage your personal information and application settings."
            theme={theme}
          />
          {/* **EDIT 32: Place Theme Toggle on Profile Page** */}
          <ProfileThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <DashboardCard className="lg:col-span-1 text-center" theme={theme}>
            <img
              src={user.avatar}
              alt="User Avatar"
              className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-500 shadow-lg"
            />
            <h3 className={`text-2xl font-bold ${textPrimary}`}>{user.name}</h3>
            <p className="text-indigo-500 font-medium mb-4">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>

            <div
              className={`text-left space-y-2 mt-6 p-4 rounded-lg ${subCardBg}`}
            >
              <p className={`text-sm ${textSecondary} flex items-center`}>
                <UserIcon className="h-4 w-4 mr-2 text-indigo-500" />
                <span className="font-semibold">Department:</span>{' '}
                {user.department}
              </p>
              <p className={`text-sm ${textSecondary} flex items-center`}>
                <TrophyIcon className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="font-semibold">Total Score:</span> {user.score}{' '}
                pts
              </p>
            </div>
          </DashboardCard>

          {/* Settings and Editing Section */}
          <div className="lg:col-span-2 space-y-8">
            <DashboardCard theme={theme}>
              <div
                className={`flex items-center mb-4 border-b ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                } pb-3`}
              >
                <SettingsIcon />
                <h3 className={`text-xl font-bold ${textPrimary} ml-2`}>
                  Account & Personal Information
                </h3>
              </div>

              <div className="space-y-4">
                {/* **EDIT 33: Name Edit** */}
                <EditableField
                  label="Name"
                  value={editingName}
                  onValueChange={setEditingName}
                  onSave={() => handleUpdateProfile('name')}
                  icon={<EditIcon className="h-4 w-4 text-indigo-500" />}
                />
                {/* **EDIT 34: Email Edit** */}
                <EditableField
                  label="Email"
                  value={editingEmail}
                  onValueChange={setEditingEmail}
                  onSave={() => handleUpdateProfile('email')}
                  icon={<SendIcon className="h-4 w-4 text-indigo-500" />}
                  type="email"
                />
                {/* **EDIT 35: Avatar Edit** */}
                <EditableField
                  label="Avatar URL"
                  value={editingAvatar}
                  onValueChange={setEditingAvatar}
                  onSave={() => handleUpdateProfile('avatar')}
                  icon={<ImageIcon className="h-4 w-4 text-indigo-500" />}
                  type="url"
                />

                {/* **EDIT 36: Password Reset Mock** */}
                <div
                  className={`p-4 rounded-lg ${subCardBg} flex justify-between items-center`}
                >
                  <div className="flex items-center">
                    <KeyIcon className="h-5 w-5 mr-3 text-red-500" />
                    <p className={`font-medium ${textPrimary}`}>
                      Reset Password
                    </p>
                  </div>
                  <button
                    onClick={handlePasswordReset}
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    Reset & Logout
                  </button>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard theme={theme}>
              <div
                className={`flex items-center mb-4 border-b ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                } pb-3`}
              >
                <SettingsIcon />
                <h3 className={`text-xl font-bold ${textPrimary} ml-2`}>
                  Backend API URL Configuration
                </h3>
              </div>
              <p className={`text-sm ${textSecondary} mb-4`}>
                This is for mock API usage.
              </p>
              <div className="flex space-x-4">
                <input
                  type="url"
                  value={newApiUrl}
                  onChange={(e) => setNewApiUrl(e.target.value)}
                  placeholder="Enter API URL"
                  className={`flex-1 p-3 border rounded-lg focus:ring-2 ${inputClasses}`}
                />
                <button
                  onClick={handleSaveApiUrl}
                  className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition"
                >
                  Save URL
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Current API URL: {apiUrl}
              </p>
            </DashboardCard>

            <DashboardCard theme={theme}>
              <div
                className={`flex items-center mb-4 border-b ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                } pb-3`}
              >
                <TrophyIcon />
                <h3 className={`text-xl font-bold ${textPrimary} ml-2`}>
                  My Achievements
                </h3>
              </div>
              <ul className="space-y-2">
                {user.achievements.length > 0 ? (
                  user.achievements.map((ach) => (
                    <li
                      key={ach.id}
                      className={`p-3 ${subCardBg} rounded-lg flex items-center`}
                    >
                      <span className="text-yellow-500 text-2xl mr-3">🏅</span>
                      <p className={`font-medium ${textPrimary}`}>{ach.text}</p>
                    </li>
                  ))
                ) : (
                  <p className={`text-center ${textSecondary} pt-5`}>
                    No personal achievements recorded yet.
                  </p>
                )}
              </ul>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
}
