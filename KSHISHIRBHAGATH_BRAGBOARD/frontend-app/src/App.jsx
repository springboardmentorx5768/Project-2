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
    score: 1250, // Updated score from activity
    contribution: 3, // NEW: Score based on comments/reactions/posts
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
    contribution: 2,
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
    contribution: 2,
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
    contribution: 2,
  },
};

const mockDepartments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR'];

// --- NEW/UPDATED MOCK SHOUTOUT DATA STRUCTURE ---
const mockShoutouts = [
  {
    id: 1,
    from: 'Jordan Lee',
    fromEmail: 'jordan@company.com', // NEW: Added sender email
    to: 'Alex Ray',
    toEmail: 'alex@company.com', // NEW: Added recipient email
    department: 'Engineering', // Sender's department
    message:
      'Incredible work on the new feature launch! Your dedication was key to our success.',
    gifUrl: null,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    avatar: 'https://placehold.co/100x100/2563EB/FFFFFF/png?text=JL',
    reactions: { '👍': ['alex@company.com', 'taylor@company.com'], '👏': ['sarah@company.com'] }, // NEW: Reactions
    comments: [ // NEW: Comments
      { id: 101, userId: 'alex@company.com', userName: 'Alex Ray', text: 'Thanks Jordan! Couldn\'t have done it without the team!', timestamp: new Date(Date.now() - 7000000).toISOString(), isReported: false },
    ],
    isReported: false, // NEW: Moderation flag
    reportCount: 0, // NEW
  },
  {
    id: 2,
    from: 'Taylor Quinn',
    fromEmail: 'taylor@company.com',
    to: 'Sarah Green',
    toEmail: 'sarah@company.com',
    department: 'HR', // Sender's department
    message:
      'Huge props to Sarah for the amazing new ad campaign. The results are already speaking for themselves!',
    gifUrl: 'https://media.giphy.com/media/l41JRsHHjEwB64TqM/giphy.gif', // Example GIF
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    avatar: 'https://placehold.co/100x100/4F46E5/FFFFFF/png?text=TQ',
    reactions: { '🔥': ['alex@company.com'], '💯': ['jordan@company.com', 'taylor@company.com'] },
    comments: [
      { id: 201, userId: 'sarah@company.com', userName: 'Sarah Green', text: 'You guys are the best!', timestamp: new Date(Date.now() - 85000000).toISOString(), isReported: false },
    ],
    isReported: true, // Mock a reported post
    reportCount: 1,
  },
  {
    id: 3,
    from: 'Alex Ray',
    fromEmail: 'alex@company.com',
    to: 'Jordan Lee',
    toEmail: 'jordan@company.com',
    department: 'Engineering', // Sender's department
    message:
      'Thanks for the great leadership and guidance on the project. Really appreciate your support!',
    gifUrl: null,
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    avatar: 'https://placehold.co/100x100/7E22CE/FFFFFF/png?text=AR',
    reactions: { '👍': ['jordan@company.com'] },
    comments: [
      { id: 301, userId: 'jordan@company.com', userName: 'Jordan Lee', text: 'My pleasure, Alex!', timestamp: new Date(Date.now() - 259000000).toISOString(), isReported: false },
      { id: 302, userId: 'sarah@company.com', userName: 'Sarah Green', text: 'Awesome teamwork!', timestamp: new Date(Date.now() - 258000000).toISOString(), isReported: true }, // Mock a reported comment
    ],
    isReported: false,
    reportCount: 0,
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

const getEmployeeEmailByName = (name) => {
  const user = allEmployeesData.find((u) => u.name === name);
  return user ? user.email : null;
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

// --- SVG ICONS (Kept as is + NEW icons) ---
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

// --- NEW ICONS FOR MODERATION & SOCIAL ---
const MessageCircleIcon = ({ className = 'h-5 w-5' }) => (
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
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"></path>
  </svg>
);
const TrashIcon = ({ className = 'h-5 w-5' }) => (
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
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const FlagIcon = ({ className = 'h-5 w-5' }) => (
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
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
);
const CheckCircleIcon = ({ className = 'h-5 w-5' }) => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const DownloadIcon = ({ className = 'h-5 w-5' }) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
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
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'dashboard', 'messages', 'profile', 'admin'
  const [currentUser, setCurrentUser] = useState(null); // Will hold user object on login
  const [error, setError] = useState('');
  const [shoutouts, setShoutouts] = useState(mockShoutouts); // Public Posts
  const [apiUrl, setApiUrl] = useState('http://127.0.0.1:8000');
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

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

  const handleRegister = (email, password, name) => {
    if (mockUsers[email]) {
      setError('User with this email already exists.');
    } else {
      mockUsers[email] = {
        password,
        name,
        email,
        role: 'employee',
        department: 'Unassigned',
        avatar: `https://placehold.co/100x100/CCCCCC/FFFFFF/png?text=${name.substring(
          0,
          1
        )}`,
        achievements: [],
        score: 0,
        contribution: 0, // NEW
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
    const newShoutout = {
      id: Date.now(),
      from: currentUser.name,
      fromEmail: currentUser.email, // NEW
      to: to,
      toEmail: getEmployeeEmailByName(to), // NEW
      department: currentUser.department,
      message: message,
      gifUrl: gifUrl,
      timestamp: new Date().toISOString(),
      avatar: currentUser.avatar,
      reactions: {}, // NEW
      comments: [], // NEW
      isReported: false, // NEW
      reportCount: 0, // NEW
    };

    setShoutouts((prev) => [newShoutout, ...prev]);
    // Optional: Update contribution score
    mockUsers[currentUser.email].contribution += 1;
    setCurrentUser({ ...currentUser, contribution: currentUser.contribution + 1 });
  };
  // -----------------------------------------------------

  // --- NEW: Reaction Handler ---
  const handleToggleReaction = (shoutoutId, emoji, userEmail) => {
    setShoutouts((prevShoutouts) =>
      prevShoutouts.map((shoutout) => {
        if (shoutout.id === shoutoutId) {
          const newReactions = { ...shoutout.reactions };
          const users = newReactions[emoji] || [];
          const userIndex = users.indexOf(userEmail);

          if (userIndex > -1) {
            // Remove reaction
            users.splice(userIndex, 1);
            if (users.length === 0) {
              delete newReactions[emoji];
            }
            // Update contribution score (Decrement)
            mockUsers[userEmail].contribution -= 1;
          } else {
            // Add reaction
            if (!newReactions[emoji]) {
              newReactions[emoji] = [];
            }
            newReactions[emoji].push(userEmail);
            // Update contribution score (Increment)
            mockUsers[userEmail].contribution += 1;
          }

          // Update current user if it's their reaction
          if (userEmail === currentUser.email) {
            setCurrentUser({ ...currentUser, contribution: mockUsers[userEmail].contribution });
          }

          return { ...shoutout, reactions: newReactions };
        }
        return shoutout;
      })
    );
  };

  // --- NEW: Comment Handler ---
  const handleAddComment = (shoutoutId, text, user) => {
    if (!text.trim()) return;

    const newComment = {
      id: Date.now(),
      userId: user.email,
      userName: user.name,
      text: text,
      timestamp: new Date().toISOString(),
      isReported: false,
    };

    setShoutouts((prevShoutouts) =>
      prevShoutouts.map((shoutout) => {
        if (shoutout.id === shoutoutId) {
          // Update contribution score
          mockUsers[user.email].contribution += 1;
          if (user.email === currentUser.email) {
            setCurrentUser({ ...currentUser, contribution: mockUsers[user.email].contribution });
          }
          return { ...shoutout, comments: [...shoutout.comments, newComment] };
        }
        return shoutout;
      })
    );
  };

  // --- NEW: Moderation Handlers ---
  const handleDeletePost = (shoutoutId) => {
    if (window.confirm('Are you sure you want to delete this shoutout? This action cannot be undone.')) {
      setShoutouts((prevShoutouts) => prevShoutouts.filter((s) => s.id !== shoutoutId));
    }
  };

  const handleDeleteComment = (shoutoutId, commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setShoutouts((prevShoutouts) =>
        prevShoutouts.map((shoutout) => {
          if (shoutout.id === shoutoutId) {
            return {
              ...shoutout,
              comments: shoutout.comments.filter((c) => c.id !== commentId),
            };
          }
          return shoutout;
        })
      );
    }
  };

  const handleReportPost = (shoutoutId) => {
    setShoutouts((prevShoutouts) =>
      prevShoutouts.map((shoutout) => {
        if (shoutout.id === shoutoutId) {
          // Prevent multiple reports
          if (shoutout.isReported) return shoutout;
          alert('Shoutout reported successfully! Admins will review it.');
          return { ...shoutout, isReported: true, reportCount: shoutout.reportCount + 1 };
        }
        return shoutout;
      })
    );
  };

  const handleResolveReport = (shoutoutId, action) => {
    // action: 'keep' or 'delete'
    if (action === 'delete') {
      handleDeletePost(shoutoutId);
      alert('Report resolved: Post deleted.');
    } else {
      setShoutouts((prevShoutouts) =>
        prevShoutouts.map((shoutout) => {
          if (shoutout.id === shoutoutId) {
            alert('Report resolved: Post marked as safe.');
            return { ...shoutout, isReported: false, reportCount: 0 };
          }
          return shoutout;
        })
      );
    }
  };

  // --- Page Renderer ---
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
            handleToggleReaction={handleToggleReaction} // NEW
            handleAddComment={handleAddComment} // NEW
            handleDeletePost={handleDeletePost} // NEW
            handleDeleteComment={handleDeleteComment} // NEW
            handleReportPost={handleReportPost} // NEW
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
            setCurrentUser={setCurrentUser}
            onLogout={handleLogout}
            apiUrl={apiUrl}
            setApiUrl={setApiUrl}
            theme={theme}
            toggleTheme={toggleTheme}
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
            handleResolveReport={handleResolveReport} // NEW
            handleDeletePost={handleDeletePost} // NEW
            handleDeleteComment={handleDeleteComment} // NEW
            mockUsers={mockUsers} // NEW for analytics
          />
        );
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
  // ... (LandingPage component content remains unchanged)
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
  <div
    className={`flex items-center justify-center min-h-screen animated-bg p-4`}
  >
    <div className="w-full max-w-sm glass-card p-8 space-y-6 z-10">
      <div className="text-center">
        <div className="flex justify-center items-center mb-4">
          <RecognitionIcon className="text-white" />
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
  handleToggleReaction,
  handleAddComment,
  handleDeletePost,
  handleReportPost,
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
            handleResolveReport={() => alert('Navigate to Admin Analytics to resolve reports.')}
            handleDeletePost={handleDeletePost}
            handleToggleReaction={handleToggleReaction}
            handleAddComment={handleAddComment}
            handleReportPost={handleReportPost}
            mockUsers={mockUsers} // Passing mockUsers for admin context
          />
        ) : (
          <EmployeeDashboard
            user={user}
            shoutouts={sortedShoutouts}
            theme={theme}
            handleToggleReaction={handleToggleReaction} // NEW
            handleAddComment={handleAddComment} // NEW
            handleReportPost={handleReportPost} // NEW
          />
        )}
      </main>
    </div>
  );
}

const Sidebar = ({ user, onLogout, currentPage, setCurrentPage, theme }) => {
  // Theme-dependent classes
  const sidebarBg =
    theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white shadow-lg';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-b';
  const navTextColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-600';
  const navHoverBg = theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
  const navActiveBg = theme === 'dark' ? 'bg-indigo-800/50' : 'bg-indigo-100';
  const profileSubText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  const NavItem = ({
    title,
    page,
    currentPage,
    setCurrentPage,
    icon,
    navTextColor,
    navHoverBg,
    navActiveBg,
    isAdminOnly = false,
  }) => {
    if (isAdminOnly && user.role !== 'admin') {
      return null;
    }
    return (
      <button
        onClick={() => setCurrentPage(page)}
        className={`flex items-center w-full px-4 py-3 rounded-xl transition duration-200 ${
          currentPage === page
            ? `${navActiveBg} text-indigo-500 font-semibold`
            : `${navTextColor} ${navHoverBg}`
        }`}
      >
        {icon}
        <span className="text-sm">{title}</span>
      </button>
    );
  };

  return (
    <aside className={`w-64 flex flex-col ${sidebarBg}`}>
      {/* App Header */}
      <div className={`flex items-center justify-center p-6 ${borderColor}`}>
        <RecognitionIcon />
        <h1 className="text-xl font-bold ml-2">Bragboard</h1>
      </div>

      {/* Navigation */}
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
        <NavItem
          title="Admin Analytics"
          page="analytics"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          icon={<ChartIcon />}
          navTextColor={navTextColor}
          navHoverBg={navHoverBg}
          navActiveBg={navActiveBg}
          isAdminOnly={true}
        />
      </nav>

      {/* User Info & Logout */}
      <div className={`p-4 border-t ${borderColor}`}>
        <div className="flex items-center mb-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-indigo-500"
          />
          <div>
            <p className="font-semibold text-sm">{user.name}</p>
            <p className={`text-xs ${profileSubText}`}>{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className={`flex items-center justify-center w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
            theme === 'dark'
              ? 'bg-gray-800 text-red-400 hover:bg-gray-700'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <LogoutIcon />
          <span className="ml-2">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const DashboardHeader = ({ title, subtitle, theme }) => {
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  return (
    <header className="mb-8">
      <h1 className={`text-3xl font-extrabold ${textPrimary}`}>{title}</h1>
      <p className={`mt-1 text-base ${textSecondary}`}>{subtitle}</p>
    </header>
  );
};

const DashboardCard = ({ children, theme, className = '' }) => {
  const cardBg = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const shadow = theme === 'dark' ? 'shadow-xl' : 'shadow-md';
  return (
    <div className={`${cardBg} rounded-2xl ${shadow} p-6 ${className}`}>
      {children}
    </div>
  );
};

// --- NEW: Reaction Buttons Component ---
const ReactionButtons = ({ shoutout, userEmail, handleToggleReaction, theme }) => {
  const commonReactions = ['👍', '👏', '🔥', '💯', '❤️'];
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';

  return (
    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
      {commonReactions.map((emoji) => {
        const users = shoutout.reactions[emoji] || [];
        const count = users.length;
        const hasReacted = users.includes(userEmail);

        return (
          <button
            key={emoji}
            onClick={() => handleToggleReaction(shoutout.id, emoji, userEmail)}
            className={`flex items-center px-2 py-1 text-xs rounded-full transition ${
              hasReacted
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
            }`}
          >
            <span className="mr-1">{emoji}</span>
            <span className={`font-semibold ${count > 0 ? textPrimary : 'text-gray-400'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// --- NEW: Comment Item Component ---
const CommentItem = ({ comment, shoutoutId, user, theme, handleDeleteComment }) => {
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const isAdminOrOwner = user.role === 'admin' || user.email === comment.userId;
  const commentBg = theme === 'dark' ? 'bg-gray-900/50' : 'bg-white';

  return (
    <div className={`flex items-start p-3 rounded-lg ${commentBg}`}>
      <img
        src={getEmployeeAvatar(comment.userName)}
        alt={comment.userName}
        className="h-7 w-7 rounded-full object-cover mr-3"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold text-indigo-500">{comment.userName}</span>
          <span className={`text-xs ml-2 ${subText}`}>{timeSince(comment.timestamp)}</span>
        </p>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} break-words`}>
          {comment.text}
        </p>
      </div>
      {isAdminOrOwner && (
        <button
          onClick={() => handleDeleteComment(shoutoutId, comment.id)}
          className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full"
          title="Delete Comment"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// --- NEW: Comment System Component ---
const CommentSystem = ({ shoutout, user, theme, handleAddComment, handleDeleteComment }) => {
  const [commentText, setCommentText] = useState('');
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  const handlePostComment = () => {
    if (commentText.trim()) {
      handleAddComment(shoutout.id, commentText, user);
      setCommentText('');
    }
  };

  const inputClasses =
    theme === 'dark'
      ? 'bg-gray-700 text-gray-100 border-gray-600 focus:ring-indigo-500'
      : 'bg-white text-gray-800 border-gray-300 focus:ring-indigo-500';

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
      <h5 className={`text-sm font-semibold ${subText} flex items-center`}>
        <MessageCircleIcon className="h-4 w-4 mr-1" />
        Comments ({shoutout.comments.length})
      </h5>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {shoutout.comments.slice().reverse().map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            shoutoutId={shoutout.id}
            user={user}
            theme={theme}
            handleDeleteComment={handleDeleteComment}
          />
        ))}
        {shoutout.comments.length === 0 && (
          <p className={`text-xs text-center p-2 ${subText}`}>No comments yet.</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
          placeholder="Add a comment..."
          className={`flex-1 p-2 text-sm border rounded-lg focus:ring-2 ${inputClasses}`}
        />
        <button
          onClick={handlePostComment}
          disabled={!commentText.trim()}
          className={`p-2 rounded-full transition ${
            commentText.trim()
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title="Post Comment"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};


// **UPGRADE: Shoutout component updated to display sender's department and new social features**
const ShoutoutItem = ({
  shoutout,
  user,
  theme,
  handleToggleReaction,
  handleAddComment,
  handleDeletePost,
  handleDeleteComment,
  handleReportPost,
  isAdminView = false, // NEW prop for Admin Dashboard
}) => {
  const { from, to, message, timestamp, avatar, gifUrl, department, fromEmail, isReported } = shoutout;
  const shoutoutBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  const isAuthor = user.email === fromEmail;
  const isAdmin = user.role === 'admin';

  return (
    <div
      className={`flex flex-col p-4 ${shoutoutBg} rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg ${isReported && isAdminView ? 'border-4 border-red-500' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1 min-w-0">
          <img
            src={avatar}
            alt={from}
            className="h-10 w-10 rounded-full mr-4 object-cover border-2 border-indigo-400"
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-1 ${subText}`}
            >
              {department}
              {isReported && <span className="ml-2 text-red-500 font-bold"> - REPORTED</span>}
            </p>
            <p className="text-sm">
              <span className="font-semibold text-indigo-500">{from}</span> gave a
              shoutout to{' '}
              <span className={`font-bold ${textPrimary}`}>{to}</span>
            </p>
            <p className={`${textPrimary} mt-2 break-words`}>{message}</p>
            <small className={`${subText} block mt-2`}>
              {formatDateTime(timestamp)}
            </small>
          </div>
        </div>
        {/* Post Actions (Delete/Report) */}
        <div className="ml-4 flex space-x-2">
          {(isAuthor || isAdmin) && handleDeletePost && (
            <button
              onClick={() => handleDeletePost(shoutout.id)}
              className="p-1 text-red-500 hover:text-red-700 rounded-full"
              title="Delete Post"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
          {!isAuthor && !isAdmin && handleReportPost && (
            <button
              onClick={() => handleReportPost(shoutout.id)}
              className="p-1 text-yellow-500 hover:text-yellow-700 rounded-full"
              title="Report Post"
              disabled={isReported}
            >
              <FlagIcon className="h-5 w-5" />
            </button>
          )}
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

      {/* --- NEW: Reactions and Comments --- */}
      <ReactionButtons
        shoutout={shoutout}
        userEmail={user.email}
        handleToggleReaction={handleToggleReaction}
        theme={theme}
      />

      <CommentSystem
        shoutout={shoutout}
        user={user}
        theme={theme}
        handleAddComment={handleAddComment}
        handleDeleteComment={handleDeleteComment}
      />
    </div>
  );
};

// --- EMPLOYEE DASHBOARD (Updated to use theme-aware components) ---
function EmployeeDashboard({ user, shoutouts, theme, handleToggleReaction, handleAddComment, handleReportPost }) {
  const recentFeed = shoutouts.slice(0, 5);

  const leaderboard = allEmployeesData
    .filter((e) => e.role === 'employee')
    .sort((a, b) => b.score - a.score); // Keep main score for leaderboard

  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <>
      <DashboardHeader
        title="Welcome to Bragboard!"
        subtitle={`Your personal score: ${user.score} points. Contribution Score: ${user.contribution}`}
        theme={theme}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* User Info & Achievements */}
        <DashboardCard className="md:col-span-1" theme={theme}>
          <div className="text-center mb-4">
            <img
              src={user.avatar}
              alt="User Avatar"
              className="h-16 w-16 rounded-full object-cover mx-auto mb-3 border-4 border-indigo-500 shadow-lg"
            />
            <h3 className={`text-xl font-bold ${textPrimary}`}>{user.name}</h3>
            <p className={`text-sm ${subText}`}>{user.department} Dept.</p>
          </div>
          <div
            className={`pt-4 border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            <h4 className={`font-semibold ${textSecondary} mb-2`}>
              Recent Achievements:
            </h4>
            <ul className={`space-y-1 text-sm ${textSecondary}`}>
              {user.achievements.length > 0 ? (
                user.achievements.map((ach) => (
                  <li key={ach.id} className="flex items-center">
                    <span className="text-indigo-500 mr-2">•</span> {ach.text}
                  </li>
                ))
              ) : (
                <li className="text-gray-400">No achievements yet.</li>
              )}
            </ul>
          </div>
        </DashboardCard>

        {/* Public Shoutout Feed */}
        <DashboardCard className="md:col-span-2 lg:col-span-2" theme={theme}>
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
                  user={user}
                  theme={theme}
                  handleToggleReaction={handleToggleReaction}
                  handleAddComment={handleAddComment}
                  handleReportPost={handleReportPost}
                  handleDeleteComment={alert} // Placeholder, can be passed if needed on employee side
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
        <DashboardCard className="md:col-span-3 lg:col-span-1" theme={theme}>
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
                    <p className={`text-xs ${subText}`}>{emp.department}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrophyIcon />
                  <span className={`font-bold ml-1 ${textPrimary}`}>
                    {emp.score}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </>
  );
}

// --- ADMIN DASHBOARD (Enhanced for Moderation & Analytics) ---
function AdminDashboard({
  user,
  shoutouts,
  theme,
  handleResolveReport,
  handleDeletePost,
  handleDeleteComment,
  handleToggleReaction,
  handleAddComment,
  handleReportPost,
  mockUsers,
}) {
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  // --- Aggregated data for analytics ---
  const totalShoutouts = shoutouts.length;
  const topRecipients = shoutouts.reduce((acc, shoutout) => {
    acc[shoutout.to] = (acc[shoutout.to] || 0) + 1;
    return acc;
  }, {});
  const topRecipientName = Object.keys(topRecipients).reduce((a, b) =>
    (topRecipients[a] > topRecipients[b] ? a : b)
  , 'N/A');

  const topContributors = Object.values(mockUsers)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3); // Get top 3 by new contribution score

  const reportedPosts = shoutouts.filter(s => s.isReported);

  // --- Export Reports Mock ---
  const handleExport = (format) => {
    alert(`Generating ${format} report for all shoutouts... (Mock functionality)`);
  };

  return (
    <>
      <DashboardHeader
        title="Admin Analytics & Moderation"
        subtitle="Overview of company recognition and platform usage."
        theme={theme}
      />

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard theme={theme}>
          <h3 className={`text-lg font-semibold ${textSecondary} mb-2`}>
            Total Shoutouts
          </h3>
          <p className={`text-4xl font-extrabold ${textPrimary}`}>
            {totalShoutouts}
          </p>
        </DashboardCard>
        <DashboardCard theme={theme}>
          <h3 className={`text-lg font-semibold ${textSecondary} mb-2`}>
            Most Recognized
          </h3>
          <p className={`text-2xl font-extrabold text-indigo-500`}>
            {topRecipientName}
          </p>
          <p className={`text-sm ${subText}`}>
            {topRecipients[topRecipientName] || 0} shoutouts received
          </p>
        </DashboardCard>
        <DashboardCard theme={theme}>
          <h3 className={`text-lg font-semibold ${textSecondary} mb-2`}>
            Top Contributor
          </h3>
          <p className={`text-2xl font-extrabold text-green-500`}>
            {topContributors.length > 0 ? topContributors[0].name : 'N/A'}
          </p>
          <p className={`text-sm ${subText}`}>
            {topContributors.length > 0 ? topContributors[0].contribution : 0} total interactions
          </p>
        </DashboardCard>
      </div>

      {/* Moderation Queue */}
      <DashboardCard theme={theme} className="mb-8">
        <h3
          className={`text-xl font-bold ${textPrimary} mb-4 border-b ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
          } pb-3 flex items-center`}
        >
          <FlagIcon className="h-6 w-6 mr-2 text-red-500" />
          Moderation Queue ({reportedPosts.length} Reported Posts)
        </h3>
        {reportedPosts.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {reportedPosts.map((shoutout) => (
              <div
                key={shoutout.id}
                className={`p-4 rounded-lg border-2 border-red-500 ${theme === 'dark' ? 'bg-gray-800' : 'bg-red-50'}`}
              >
                <ShoutoutItem
                  shoutout={shoutout}
                  user={user}
                  theme={theme}
                  handleToggleReaction={handleToggleReaction}
                  handleAddComment={handleAddComment}
                  handleDeletePost={handleDeletePost}
                  handleDeleteComment={handleDeleteComment}
                  handleReportPost={handleReportPost}
                  isAdminView={true}
                />
                <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-red-200 dark:border-red-800">
                  <button
                    onClick={() => handleResolveReport(shoutout.id, 'keep')}
                    className="flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" /> Resolve & Keep
                  </button>
                  <button
                    onClick={() => handleResolveReport(shoutout.id, 'delete')}
                    className="flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" /> Delete Post
                  </button>
                </div>
              </div>
            ))}
            {reportedPosts.some(s => s.comments.some(c => c.isReported)) && (
              <p className={`text-sm ${subText} mt-2`}>
                *Note: Some comments within non-reported posts may also be reported (not fully implemented in this view, rely on Delete Comment button in all posts for full moderation).
              </p>
            )}
          </div>
        ) : (
          <p className={`text-center ${subText} pt-5`}>
            The moderation queue is clear. Great job!
          </p>
        )}
      </DashboardCard>

      {/* All Shoutout Feed & Export */}
      <DashboardCard theme={theme}>
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`text-xl font-bold ${textPrimary} border-b ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            } pb-2`}
          >
            All Public Shoutouts (Full Feed)
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('PDF')}
              className="flex items-center px-3 py-1 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              <DownloadIcon className="h-4 w-4 mr-1" /> Export PDF
            </button>
            <button
              onClick={() => handleExport('CSV')}
              className="flex items-center px-3 py-1 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              <DownloadIcon className="h-4 w-4 mr-1" /> Export CSV
            </button>
          </div>
        </div>
        <div className="space-y-4 max-h-[800px] overflow-y-auto">
          {shoutouts.map((shoutout) => (
             <ShoutoutItem
              key={shoutout.id}
              shoutout={shoutout}
              user={user}
              theme={theme}
              handleToggleReaction={handleToggleReaction}
              handleAddComment={handleAddComment}
              handleDeletePost={handleDeletePost}
              handleDeleteComment={handleDeleteComment} // Admin can delete any comment here
              handleReportPost={handleReportPost}
            />
          ))}
          {shoutouts.length === 0 && (
            <p className={`text-center ${subText} pt-10`}>
              No public posts yet.
            </p>
          )}
        </div>
      </DashboardCard>
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
            className={`w-full h-auto rounded-lg cursor-pointer object-cover border-2 border-transparent transition ${hoverBorder}`}
            loading="lazy"
          />
        ))}
      </div>
      <button
        onClick={onClose}
        className={`mt-3 w-full text-sm font-medium rounded-lg py-1 transition ${
          theme === 'dark'
            ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Close
      </button>
    </div>
  );
};
// -----------------------------------------------------------

// --- PUBLIC POSTING PAGE ---
function PublicPostPage({
  user,
  setCurrentPage,
  shoutouts,
  handleNewPost,
  theme,
}) {
  // Local state for the form
  const [recipient, setRecipient] = useState('All'); // 'All' for public, or employee name
  const [currentMessage, setCurrentMessage] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);

  const inputRef = useRef(null);

  // Filter employees for the mention/recipient list
  const filteredEmployees = allEmployees.filter(
    (name) => name !== user.name // Cannot send a shoutout to self
  );

  const handleSend = () => {
    if (!currentMessage.trim() && !selectedGif) {
      alert('Message or GIF is required.');
      return;
    }

    let finalRecipient = recipient;

    // Call the global handler
    handleNewPost({
      to: finalRecipient,
      message: currentMessage,
      gifUrl: selectedGif, // Pass selected GIF
    });

    // Reset form state
    setCurrentMessage('');
    setRecipient('All');
    setSelectedGif(null);
    setIsEmojiPickerOpen(false);
    setIsGifPickerOpen(false);

    // Navigate back to the dashboard or stay on page
    setCurrentPage('dashboard');
  };

  // Sort by date descending
  const sortedShoutouts = [...shoutouts].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  const recentlyPosted = sortedShoutouts.slice(0, 5);

  // Theme-dependent classes
  const mainBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const popupBg =
    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200';
  const popupHover = theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-indigo-50';
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
    // setSelectedGif(null); // Clear selected GIF if user starts typing a new message - maybe keep it unless they change recipient

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
      // Replace the mention trigger (@...) with the full name
      const atIndex = currentMessage.lastIndexOf('@');
      if (atIndex !== -1) {
        newMessage =
          currentMessage.substring(0, atIndex) + `${employeeName} `;
      }
    }
    setCurrentMessage(newMessage);
    setShowEmployeeList(false);
    inputRef.current.focus();
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
          title="Post a Shoutout"
          subtitle="Give public recognition to a peer or the whole company!"
          theme={theme}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Creation Column */}
          <div className="lg:col-span-2 space-y-4">
            <DashboardCard theme={theme}>
              <h3
                className={`text-2xl font-bold ${textPrimary} mb-4 flex items-center`}
              >
                <SendIcon />
                <span className="ml-2">Create New Post</span>
              </h3>

              {/* Recipient Selector */}
              <div className="mb-6">
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
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
                  placeholder={`Write your congratulation or message here... (Hit enter to send or type @ to mention an employee)`}
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
                    {filteredEmployees
                      .filter((name) =>
                        name
                          .toLowerCase()
                          .includes(
                            currentMessage.toLowerCase().split('@').pop().trim()
                          )
                      )
                      .map((name) => (
                        <button
                          key={name}
                          onClick={() => handleSelectEmployee(name)}
                          className={`flex items-center w-full p-2 text-sm text-left transition ${popupHover} ${
                            recipient === name ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''
                          }`}
                        >
                          <img
                            src={getEmployeeAvatar(name)}
                            alt={name}
                            className="h-6 w-6 rounded-full mr-2"
                          />
                          {name}
                        </button>
                      ))}
                    {filteredEmployees.filter((name) =>
                      name
                        .toLowerCase()
                        .includes(
                          currentMessage.toLowerCase().split('@').pop().trim()
                        )
                    ).length === 0 && (
                      <p className={`p-2 text-sm ${subText}`}>
                        No employee found.
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute right-3 bottom-3 flex space-x-2">
                  <button
                    onClick={() => setIsGifPickerOpen((prev) => !prev)}
                    className={`h-9 w-9 flex items-center justify-center rounded-full transition ${
                      isGifPickerOpen
                        ? buttonActive
                        : selectedGif
                        ? 'text-white bg-indigo-500 hover:bg-indigo-600'
                        : buttonInactive
                    }`}
                    title="Insert GIF"
                  >
                    <GifIcon />
                  </button>
                  <button
                    onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                    className={`h-9 w-9 flex items-center justify-center rounded-full transition ${
                      isEmojiPickerOpen ? buttonActive : buttonInactive
                    }`}
                    title="Insert Emoji"
                  >
                    <span className="text-xl">😊</span>
                  </button>
                  <button
                    onClick={handleSend}
                    className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition"
                    title="Send Public Post"
                    disabled={!currentMessage.trim() && !selectedGif}
                  >
                    <SendIcon />
                  </button>
                </div>

                {isEmojiPickerOpen && (
                  <EmojiPicker onSelect={handleSelectEmoji} theme={theme} />
                )}

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
                  <div key={post.id} className="p-2 border-b last:border-b-0 border-gray-200 dark:border-gray-600">
                    <p className={`text-sm ${textPrimary}`}>
                      <span className="font-semibold text-indigo-500">{post.from}</span> to{' '}
                      <span className="font-bold">{post.to}</span>
                    </p>
                    <p className={`text-xs ${subText} truncate`}>{post.message}</p>
                  </div>
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

// --- PROFILE PAGE (Settings) ---
function ProfilePage({
  user,
  setCurrentUser,
  onLogout,
  apiUrl,
  setApiUrl,
  setCurrentPage,
  theme,
  toggleTheme,
}) {
  // Mock state for editing fields
  const [editingName, setEditingName] = useState(user.name);
  const [editingEmail, setEditingEmail] = useState(user.email);
  const [editingAvatar, setEditingAvatar] = useState(user.avatar);
  const [newApiUrl, setNewApiUrl] = useState(apiUrl);

  // NOTE: This uses the mockUsers object directly to persist changes across the application mock.
  const [mockStateUsers, setMockStateUsers] = useState(mockUsers); // State to trigger re-render if mockUsers is modified

  const handleSave = (field) => {
    // 1. Update the object in mockUsers
    // Find the key in mockUsers
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
    setMockStateUsers({ ...mockUsers }); // Simulate successful save
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

  // Helper component for editable fields
  const EditableField = ({
    label,
    value,
    onValueChange,
    onSave,
    isDirty,
    icon,
    fieldKey,
    type = 'text',
  }) => {
    // Use user prop here for accurate dirty check against the actual user prop key
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
            <p className={`text-sm ${textSecondary}`}>{user.department}</p>
            <p className={`text-xs mt-1 ${textSecondary}`}>
              Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>

            <div
              className={`mt-6 pt-6 border-t ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
              }`}
            >
              <p className={`text-xl font-bold text-yellow-500 mb-2 flex items-center justify-center`}>
                <TrophyIcon className="h-6 w-6 mr-1" />
                {user.score} Points
              </p>
              <p className={`text-xs ${textSecondary}`}>
                Your total recognition score.
              </p>
            </div>
            <div
              className={`mt-4 pt-4 border-t ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
              }`}
            >
              <p className={`text-xl font-bold text-indigo-500 mb-2 flex items-center justify-center`}>
                <MessageCircleIcon className="h-6 w-6 mr-1" />
                {user.contribution} Interactions
              </p>
              <p className={`text-xs ${textSecondary}`}>
                Total reactions, comments, and posts.
              </p>
            </div>
          </DashboardCard>

          {/* Account Settings (Edits) */}
          <div className="lg:col-span-2 space-y-8">
            <DashboardCard theme={theme}>
              <div
                className={`flex items-center mb-4 border-b ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                } pb-3`}
              >
                <ProfileIcon />
                <h3 className={`text-xl font-bold ${textPrimary} ml-2`}>
                  Account Information
                </h3>
              </div>
              <div className="space-y-4">
                <EditableField
                  label="Full Name"
                  value={editingName}
                  onValueChange={setEditingName}
                  onSave={() => handleSave('name')}
                  isDirty={editingName !== user.name}
                  icon={<UserIcon className="h-5 w-5" />}
                  fieldKey="name"
                />
                <EditableField
                  label="Email Address"
                  value={editingEmail}
                  onValueChange={setEditingEmail}
                  onSave={() => handleSave('email')}
                  isDirty={editingEmail !== user.email}
                  icon={<UserIcon className="h-5 w-5" />}
                  fieldKey="email"
                />
                <EditableField
                  label="Avatar URL"
                  value={editingAvatar}
                  onValueChange={setEditingAvatar}
                  onSave={() => handleSave('avatar')}
                  isDirty={editingAvatar !== user.avatar}
                  icon={<ImageIcon className="h-5 w-5" />}
                  fieldKey="avatar"
                />
              </div>
            </DashboardCard>

            <DashboardCard theme={theme}>
              <div
                className={`flex items-center mb-4 border-b ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                } pb-3`}
              >
                <KeyIcon />
                <h3 className={`text-xl font-bold ${textPrimary} ml-2`}>
                  Security Settings
                </h3>
              </div>
              <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-between">
                <p className={`text-sm font-medium text-red-700 dark:text-red-300`}>
                  Need to update your password?
                </p>
                <button
                  onClick={handlePasswordReset}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Reset Password
                </button>
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
                  placeholder="e.g., http://your-backend.com"
                  className={`flex-1 p-2 border rounded-lg focus:ring-2 ${inputClasses}`}
                />
                <button
                  onClick={handleSaveApiUrl}
                  disabled={newApiUrl === apiUrl || !newApiUrl}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                    newApiUrl !== apiUrl && newApiUrl
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
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
