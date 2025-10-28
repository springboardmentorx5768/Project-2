import React, { useState, useEffect, useRef } from 'react';

// --- MOCK DATA ---
// NOTE: I've updated the mockShoutouts timestamps to be proper ISO strings
// so they can be accurately sorted.
const mockUsers = {
  'employee@company.com': {
    password: 'password123',
    name: 'Alex Ray',
    role: 'employee',
    department: 'Engineering',
    avatar: 'https://placehold.co/100x100/7E22CE/FFFFFF/png?text=AR',
    achievements: [
      { id: 1, text: 'Top Performer Q2' },
      { id: 2, text: 'Innovation Award' },
    ],
    score: 1250,
  },
  'manager@company.com': {
    password: 'password123',
    name: 'Jordan Lee',
    role: 'employee',
    department: 'Engineering',
    avatar: 'https://placehold.co/100x100/2563EB/FFFFFF/png?text=JL',
    achievements: [{ id: 1, text: 'Project Milestone Champion' }],
    score: 850,
  },
  'admin@company.com': {
    password: 'password123',
    name: 'Taylor Quinn',
    role: 'admin',
    department: 'HR',
    avatar: 'https://placehold.co/100x100/4F46E5/FFFFFF/png?text=TQ',
    achievements: [],
    score: 0,
  },
  'sarah@company.com': {
    password: 'password123',
    name: 'Sarah Green',
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
    department: 'Engineering',
    message:
      'Incredible work on the new feature launch! Your dedication was key to our success.',
    // Converted to ISO string for accurate sorting
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    avatar: 'https://placehold.co/100x100/2563EB/FFFFFF/png?text=JL',
  },
  {
    id: 2,
    from: 'Taylor Quinn',
    to: 'Sarah Green',
    department: 'Marketing',
    message:
      'Huge props to Sarah for the amazing new ad campaign. The results are already speaking for themselves!',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    avatar: 'https://placehold.co/100x100/4F46E5/FFFFFF/png?text=TQ',
  },
  {
    id: 3,
    from: 'Alex Ray',
    to: 'Jordan Lee',
    department: 'Engineering',
    message:
      'Thanks for the great leadership and guidance on the project. Really appreciate your support!',
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    avatar: 'https://placehold.co/100x100/7E22CE/FFFFFF/png?text=AR',
  },
];

// Existing mockMessages is now unused but kept for reference if needed elsewhere.
const mockMessages = [
  {
    id: 1,
    from: 'Alex Ray',
    to: 'Jordan Lee',
    message: 'Hey Jordan, when can we discuss the Q3 budget report? Looks good!',
    timestamp: '5 min ago',
  },
];

const allEmployees = Object.values(mockUsers).map((u) => u.name);
const allEmployeesData = Object.values(mockUsers);

// --- UTILITY FUNCTIONS ---
const getEmployeeAvatar = (name) => {
  const user = allEmployeesData.find(u => u.name === name);
  return user ? user.avatar : 'https://placehold.co/100x100/94A3B8/FFFFFF/png?text=?';
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

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'dashboard', 'messages', 'profile', 'admin'
  const [currentUser, setCurrentUser] = useState(null); // Will hold user object on login
  const [error, setError] = useState('');
  const [shoutouts, setShoutouts] = useState(mockShoutouts); // Public Posts
  const [apiUrl, setApiUrl] = useState('http://127.0.0.1:8000');
  
  // NOTE: Private messages state is removed as per requirements

  const handleLogin = (email, password) => {
    if (mockUsers[email] && mockUsers[email].password === password) {
      setCurrentUser(mockUsers[email]);
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
      // In a real app, you would send this to the server
      mockUsers[email] = {
        password,
        name,
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
  const handleNewPublicPost = ({ to, message }) => {
    const newShoutout = {
      id: Date.now(),
      from: currentUser.name,
      to: to,
      department: currentUser.department,
      message: message,
      timestamp: new Date().toISOString(), // Use current ISO time for accurate sorting
      avatar: currentUser.avatar,
    };
    
    // 1. Post directly to the public feed (shoutouts)
    // The new post will immediately appear on the Dashboard and the PublicPostPage's "Recently Posted" column
    setShoutouts((prev) => 
      [newShoutout, ...prev] // New posts appear at the top
      // Note: In a real app, you'd make an API call here.
    ); 
  };
  // -----------------------------------------------------

  const renderPage = () => {
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
            shoutouts={shoutouts} // Pass updated shoutouts
            setCurrentPage={setCurrentPage}
          />
        );
      }
      if (currentPage === 'messages') { // Renamed internally to PublicPostPage
        return (
          <PublicPostPage 
            user={currentUser}
            setCurrentPage={setCurrentPage}
            shoutouts={shoutouts} // Pass shoutouts to display recent ones
            handleNewPost={handleNewPublicPost} // Pass the public posting function
          />
        );
      }
      if (currentPage === 'profile') {
        return (
          <ProfilePage
            user={currentUser}
            setCurrentPage={setCurrentPage}
            apiUrl={apiUrl}
            setApiUrl={setApiUrl}
          />
        );
      }
      if (currentPage === 'analytics' && currentUser.role === 'admin') {
        return (
          <Dashboard
            user={currentUser}
            onLogout={handleLogout}
            shoutouts={shoutouts}
            setCurrentPage={setCurrentPage}
          />
        ); // Admin's dashboard is reused for now
      }
    }

    // Default back to login
    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateToRegister={() => setCurrentPage('register')}
        error={error}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {renderPage()}
    </div>
  );
}

// ----------------------------------------------------------------------
// --- AUTH PAGES (Shadow Fix Applied) ---
// ----------------------------------------------------------------------
const AuthLayout = ({ title, children }) => (
  // Shadow Fix: Simplified background gradient and reduced the shadow strength on the card (shadow-2xl -> shadow-lg)
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-center mb-4">
          <RecognitionIcon />
          <h1 className="text-2xl font-bold text-gray-800">Recognition+</h1>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

function LoginPage({ onLogin, onNavigateToRegister, error }) {
  const [email, setEmail] = useState('employee@company.com');
  const [password, setPassword] = useState('password123');
  const [department, setDepartment] = useState('Engineering'); // Department is unused in logic but kept for form consistency

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <AuthLayout title="Welcome Back!">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="relative">
          <BuildingIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white"
          >
            {mockDepartments.slice(1).map((dep) => (
              <option key={dep} value={dep}>
                {dep} Department
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Sign In
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{' '}
        <button
          onClick={onNavigateToRegister}
          className="font-medium text-indigo-600 hover:text-indigo-500"
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

  return (
    <AuthLayout title="Create Your Account">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Create Account
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <button
          onClick={onNavigateToLogin}
          className="font-medium text-indigo-600 hover:text-indigo-500"
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
function Dashboard({ user, onLogout, shoutouts, setCurrentPage }) {
  
  // Sort shoutouts from newest to oldest based on ISO timestamp
  const sortedShoutouts = [...shoutouts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} onLogout={onLogout} currentPage="dashboard" setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {user.role === 'admin' ? (
          <AdminDashboard user={user} shoutouts={sortedShoutouts} />
        ) : (
          <EmployeeDashboard user={user} shoutouts={sortedShoutouts} />
        )}
      </main>
    </div>
  );
}

const Sidebar = ({ user, onLogout, currentPage, setCurrentPage }) => (
  <aside className="w-64 bg-white shadow-lg flex flex-col">
    <div className="flex items-center justify-center p-6 border-b">
      <RecognitionIcon />
      <h1 className="text-xl font-bold text-gray-800 ml-2">Recognition+</h1>
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
      />
      <NavItem
        title="Post Message" // Renamed from "Messages" to "Post Message" for clarity
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
      />
      {user.role === 'admin' && (
        <NavItem
          title="Analytics"
          page="analytics"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          icon={<ChartIcon />}
        />
      )}
      <NavItem
        title="Profile"
        page="profile"
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        icon={<ProfileIcon />}
      />
    </nav>
    <div className="p-4 border-t">
      <div className="flex items-center">
        <img
          src={user.avatar}
          alt="User Avatar"
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <p className="font-semibold text-sm text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">{user.department}</p>
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

const NavItem = ({ title, page, currentPage, setCurrentPage, icon }) => (
  <button
    onClick={() => setCurrentPage(page)}
    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors duration-150 ${
      currentPage === page
        ? 'text-gray-900 bg-gray-200 font-semibold'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    {title}
  </button>
);

// --- UTILITY COMPONENTS ---
const DashboardHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
    <p className="text-gray-500 mt-1">{subtitle}</p>
  </div>
);

const DashboardCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-md p-6 ${className}`}>
    {children}
  </div>
);

// --- EMPLOYEE DASHBOARD (Updated to use sorted Shoutouts) ---
function EmployeeDashboard({ user, shoutouts }) {
    // Only shows the 5 most recent shoutouts on the main dashboard feed for simplicity
    const recentFeed = shoutouts.slice(0, 5);
    
    // Sort employees by score for Leaderboard (descending)
    const leaderboard = allEmployeesData
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return (
        <>
            <DashboardHeader 
                title={`Welcome, ${user.name}!`}
                subtitle="View the latest company shoutouts and your standing."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Score Card */}
                <DashboardCard className="md:col-span-1 flex flex-col justify-between">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <TrophyIcon /> Your Recognition Score
                    </h3>
                    <div className="text-center my-6">
                        <p className="text-6xl font-extrabold text-indigo-600">{user.score}</p>
                        <p className="text-gray-500 mt-1">Total Points</p>
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Recent Achievements:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                            {user.achievements.length > 0 ? (
                                user.achievements.map(ach => (
                                    <li key={ach.id} className="flex items-center">
                                        <span className="text-indigo-500 mr-2">•</span>{ach.text}
                                    </li>
                                ))
                            ) : (<li className="text-gray-400">No achievements yet.</li>)}
                        </ul>
                    </div>
                </DashboardCard>

                {/* Public Shoutout Feed (Updated to show public posts) */}
                <DashboardCard className="md:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                        Recent Public Shoutouts (Company Feed)
                    </h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {recentFeed.length > 0 ? (
                            recentFeed.map(shoutout => (
                                <div key={shoutout.id} className="flex p-4 bg-gray-50 rounded-lg shadow-sm">
                                    <img src={shoutout.avatar} alt={shoutout.from} className="h-10 w-10 rounded-full mr-4 object-cover" />
                                    <div className='flex-1'>
                                        <p className="text-sm">
                                            <span className="font-semibold text-indigo-600">{shoutout.from}</span> gave a shoutout to <span className="font-bold text-gray-800">{shoutout.to}</span>
                                        </p>
                                        <p className="text-gray-700 mt-1">{shoutout.message}</p>
                                        <small className="text-xs text-gray-500">{timeSince(shoutout.timestamp)}</small>
                                    </div>
                                </div>
                            ))
                        ) : (<p className="text-center text-gray-500 pt-10">No public posts yet. Be the first!</p>)}
                    </div>
                </DashboardCard>
                
                {/* Leaderboard */}
                <DashboardCard className="md:col-span-3">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Top Performers Leaderboard</h3>
                    <ul className="space-y-3">
                        {leaderboard.map((emp, index) => (
                            <li key={emp.name} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                                <div className="flex items-center">
                                    <span className={`text-lg font-bold mr-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-amber-700' : 'text-gray-600'}`}>{index + 1}.</span>
                                    <img src={emp.avatar} alt={emp.name} className="h-8 w-8 rounded-full object-cover mr-3" />
                                    <div>
                                        <p className="font-semibold">{emp.name}</p>
                                        <p className="text-xs text-indigo-700">{emp.department}</p>
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-indigo-800">{emp.score} pts</div>
                            </li>
                        ))}
                    </ul>
                </DashboardCard>

            </div>
        </>
    );
}

// --- ADMIN DASHBOARD (Unchanged Logic, uses sorted Shoutouts) ---
function AdminDashboard({ user, shoutouts }) {
    // Admin content can be further developed, currently reuses EmployeeDashboard features
    return (
        <>
            <DashboardHeader 
                title={`Admin Panel - Welcome, ${user.name}!`}
                subtitle="Overview of company recognition and analytics."
            />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Example Admin Metric Card */}
                <DashboardCard className="md:col-span-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Total Shoutouts</h3>
                    <p className="text-6xl font-extrabold text-green-600">{shoutouts.length}</p>
                    <p className="text-gray-500 mt-1">Since last quarter</p>
                </DashboardCard>
                
                {/* Admin Feed */}
                <DashboardCard className="md:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                        All Public Shoutout Feed
                    </h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {shoutouts.map(shoutout => (
                            <div key={shoutout.id} className="flex p-4 bg-gray-50 rounded-lg shadow-sm">
                                <img src={shoutout.avatar} alt={shoutout.from} className="h-10 w-10 rounded-full mr-4 object-cover" />
                                <div className='flex-1'>
                                    <p className="text-sm">
                                        <span className="font-semibold text-indigo-600">{shoutout.from}</span> to <span className="font-bold text-gray-800">{shoutout.to}</span>
                                    </p>
                                    <p className="text-gray-700 mt-1">{shoutout.message}</p>
                                    <small className="text-xs text-gray-500">{timeSince(shoutout.timestamp)}</small>
                                </div>
                            </div>
                        ))}
                        {shoutouts.length === 0 && <p className="text-center text-gray-500 pt-10">No public posts yet.</p>}
                    </div>
                </DashboardCard>
            </div>
        </>
    );
}


// ----------------------------------------------------------------------
// --- PUBLIC POST PAGE (Renamed and Updated from MessagesPage) ---
// ----------------------------------------------------------------------
function PublicPostPage({ user, setCurrentPage, shoutouts, handleNewPost }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [recipient, setRecipient] = useState('All'); // Default recipient to 'All' for public post
  const inputRef = useRef(null);

  // Filter and sort shoutouts to get the 5 most recent
  const sortedShoutouts = [...shoutouts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recentlyPosted = sortedShoutouts.slice(0, 5);

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setCurrentMessage(value);
    
    // Simple check to show employee list when typing '@'
    if (value.includes('@') && !value.endsWith(' ')) {
        setShowEmployeeList(true);
    } else {
        setShowEmployeeList(false);
    }
  };

  const handleSelectEmployee = (employeeName) => {
    // Replace the '@' (and potential partial name) with the selected name
    const newRecipient = employeeName === 'All' ? 'All' : employeeName;
    setRecipient(newRecipient);
    
    // If selecting an individual, replace the '@' and add their name
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
    if (!currentMessage.trim()) return;

    // Post message to the public feed
    handleNewPost({ 
        to: recipient, 
        message: currentMessage.trim() 
    }); 

    setCurrentMessage('');
    setRecipient('All'); // Reset recipient to 'All' after public post
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} onLogout={() => setCurrentPage('login')} currentPage="messages" setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <DashboardHeader
          title="Public Recognition & Congratulations"
          subtitle="Post a public message to recognize a colleague's efforts."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Post/Compose Area */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardCard className="h-full flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Post to Public Feed
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient:</label>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setRecipient('All')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                            recipient === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Public Post (To All)
                    </button>
                    <div className="text-sm text-gray-600">
                        Current Target: <span className="font-bold text-indigo-700">{recipient}</span>
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
                  className="w-full p-3 pr-24 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500"
                  rows="5"
                ></textarea>

                {/* Employee List Popup */}
                {showEmployeeList && (
                  <div className="absolute bottom-full left-0 mb-2 w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <p className="p-2 text-sm font-semibold text-gray-500 border-b">Select Employee</p>
                    {allEmployees
                      .filter(name => name.toLowerCase().includes(currentMessage.toLowerCase().split('@').pop().trim()))
                      .filter(name => name !== user.name)
                      .map((name) => (
                        <div
                          key={name}
                          onClick={() => handleSelectEmployee(name)}
                          className="p-2 hover:bg-indigo-50 cursor-pointer text-sm flex items-center"
                        >
                            <img src={getEmployeeAvatar(name)} alt={name} className="h-6 w-6 rounded-full mr-2"/>
                          {name}
                        </div>
                      ))}
                      <div
                          onClick={() => handleSelectEmployee('All')}
                          className="p-2 hover:bg-indigo-50 cursor-pointer text-sm font-bold text-indigo-600 border-t"
                        >
                          All (Public Post)
                        </div>
                  </div>
                )}

                {/* Send Button */}
                <div className="absolute right-2 bottom-2 flex space-x-2">
                  <button
                    onClick={handleSend}
                    className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition"
                    title="Send Public Post"
                    disabled={!currentMessage.trim()}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Recently Posted Column */}
          <div className="lg:col-span-1 space-y-4">
            <DashboardCard className="h-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Recently Posted</h3>
              <ul className="space-y-4">
                {recentlyPosted.map(post => (
                  <li key={post.id} className="p-3 bg-gray-50 rounded-lg shadow-sm">
                    <div className="flex items-start">
                        <img src={post.avatar} alt={post.from} className="h-8 w-8 rounded-full object-cover mr-3"/>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                                {post.from} to {post.to}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {post.message}
                            </p>
                            <small className="text-xs text-indigo-500">{timeSince(post.timestamp)}</small>
                        </div>
                    </div>
                  </li>
                ))}
                {recentlyPosted.length === 0 && <li>No recent public posts.</li>}
              </ul>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- PROFILE PAGE (Unchanged Logic) ---
function ProfilePage({ user, setCurrentPage, apiUrl, setApiUrl }) {
  const [newApiUrl, setNewApiUrl] = useState(apiUrl);

  const handleSaveApiUrl = () => {
    setApiUrl(newApiUrl);
    alert('API URL Updated!');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} onLogout={() => setCurrentPage('login')} currentPage="profile" setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <DashboardHeader
          title="My Profile"
          subtitle="Manage your personal information and application settings."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <DashboardCard className="lg:col-span-1 text-center">
            <img
              src={user.avatar}
              alt="User Avatar"
              className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-500 shadow-lg"
            />
            <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
            <p className="text-indigo-600 font-medium mb-4">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>

            <div className="text-left space-y-2 mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-indigo-500" />
                <span className="font-semibold">Department:</span> {user.department}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <TrophyIcon className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="font-semibold">Total Score:</span> {user.score} pts
              </p>
            </div>
          </DashboardCard>

          {/* API Configuration & Achievements */}
          <div className="lg:col-span-2 space-y-8">
            <DashboardCard>
              <div className="flex items-center mb-4 border-b pb-3">
                <SettingsIcon />
                <h3 className="text-xl font-bold text-gray-800 ml-2">Backend API URL Configuration</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                This is for mock API usage. In a production environment, this would be locked down.
              </p>
              <div className="flex space-x-4">
                <input
                  type="url"
                  value={newApiUrl}
                  onChange={(e) => setNewApiUrl(e.target.value)}
                  placeholder="Enter API URL"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSaveApiUrl}
                  className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition"
                >
                  Save URL
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Current API URL: {apiUrl}</p>
            </DashboardCard>

            <DashboardCard>
                <div className="flex items-center mb-4 border-b pb-3">
                    <TrophyIcon />
                    <h3 className="text-xl font-bold text-gray-800 ml-2">My Achievements</h3>
                </div>
                <ul className="space-y-2">
                    {user.achievements.length > 0 ? (
                        user.achievements.map(ach => (
                            <li key={ach.id} className="p-3 bg-indigo-50 rounded-lg flex items-center">
                                <span className="text-yellow-500 text-2xl mr-3">🏅</span>
                                <p className="font-medium text-gray-700">{ach.text}</p>
                            </li>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 pt-5">No personal achievements recorded yet.</p>
                    )}
                </ul>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
}