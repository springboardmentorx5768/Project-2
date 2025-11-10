import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Avatar as MuiAvatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'; // <-- NAYA ICON
import axios from 'axios';
import LogoutIcon from '@mui/icons-material/Logout';

// Background images
const backgroundImages = {
  '/dashboard': 'https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
  '/brag-board': 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
  '/shoutouts': 'https://images.pexels.com/photos/5668853/pexels-photo-5668853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
  '/members': 'https://images.pexels.com/photos/7176335/pexels-photo-7176335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
  '/admin': 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
  '/leaderboard': 'https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Nayi Image
  '/settings': 'https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
};

// --- Avatar ke helper functions ---
function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  const displayName = name.split('@')[0] || 'User';
  const initials = displayName.length > 1 ? displayName.substring(0, 1).toUpperCase() : (displayName[0] ? displayName[0].toUpperCase() : 'U');
  
  return {
    sx: {
      bgcolor: stringToColor(name),
      color: 'white',
      width: 40,
      height: 40,
    },
    children: initials,
  };
}

function Layout({ children }) {
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('member'); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUserEmail(response.data.email);
          setUserRole(response.data.role); 
        } catch (error) {
          console.error("Failed to fetch user", error);
          handleLogout(); 
        }
      }
    };
    fetchUser();
  }, [handleLogout]); 

  useEffect(() => {
    const path = location.pathname;
    const image = backgroundImages[path] || backgroundImages['/dashboard']; 
    setCurrentBackgroundImage(image);
  }, [location.pathname]); 

  const getLinkClasses = (path) => {
    const baseClasses = "flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors";
    
    if (location.pathname === path) {
      return `${baseClasses} bg-gray-700 text-white font-bold`; 
    }
    if (location.pathname === "/dashboard" && path === "/dashboard") {
         return `${baseClasses} bg-gray-700 text-white font-bold`; 
    }
    return baseClasses;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-300">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700 h-16 flex items-center">
          <h1 className="text-2xl font-bold">BragBoard Admin</h1>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link to="/dashboard" className={getLinkClasses("/dashboard")}>
            <DashboardIcon className="mr-3" /> Dashboard
          </Link>
          <Link to="/brag-board" className={getLinkClasses("/brag-board")}>
            <EmojiEventsIcon className="mr-3" /> Brag Board
          </Link>
          <Link to="/shoutouts" className={getLinkClasses("/shoutouts")}>
            <CampaignIcon className="mr-3" /> Shout-outs
          </Link>
          
          {/* --- YEH NAYA LINK ADD HUA HAI --- */}
          <Link to="/leaderboard" className={getLinkClasses("/leaderboard")}>
            <MilitaryTechIcon className="mr-3" /> Leaderboard
          </Link>

          <Link to="/members" className={getLinkClasses("/members")}>
            <GroupIcon className="mr-3" /> Members
          </Link>
          
          {userRole === 'admin' && (
            <Link to="/admin" className={getLinkClasses("/admin")}>
                <AdminPanelSettingsIcon className="mr-3" /> Admin
            </Link>
          )}

          <Link to="/settings" className={getLinkClasses("/settings")}>
            <SettingsIcon className="mr-3" /> Settings
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center h-16">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {userEmail ? userEmail.split('@')[0] : 'Admin'}!
          </h2>
          <div className="flex items-center gap-4">
            <MuiAvatar {...stringAvatar(userEmail || 'A')} />
            <Button variant="outlined" color="error" onClick={handleLogout} startIcon={<LogoutIcon/>}>
              Logout
            </Button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto p-6 flex justify-center items-start relative"
          style={{
            backgroundImage: currentBackgroundImage !== 'none' ? `url("${currentBackgroundImage}")` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backgroundBlendMode: 'overlay',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;