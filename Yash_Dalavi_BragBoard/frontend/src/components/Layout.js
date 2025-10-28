import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // useLocation hook import karein
import { Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import Avatar from './Avatar';
import axios from 'axios';

// Har page ke liye background images
const backgroundImages = {
  '/dashboard': 'https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Teamwork for dashboard
  '/brag-board': 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Achievement / Success for Brag Board
  '/shoutouts': 'https://images.pexels.com/photos/5668853/pexels-photo-5668853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Communication / Announcement for Shout-outs
  '/members': 'https://images.pexels.com/photos/7176335/pexels-photo-7176335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Group of people for Members
  '/settings': 'https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Gears/Abstract for Settings
};

function Layout({ children }) {
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Current URL path ko access karne ke liye

  // Current background image ko state me rakhein
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState('');

  // Jab layout load ho, to user ka email fetch karein
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUserEmail(response.data.email);
        } catch (error) {
          console.error("Failed to fetch user", error);
          handleLogout(); 
        }
      }
    };
    fetchUser();
  }, []);

  // Jab location (URL path) badle, to background image update karein
  useEffect(() => {
    // Current path ke liye sahi image dhoondein
    const image = backgroundImages[location.pathname] || 'none'; // Agar koi match nahi, to 'none'
    setCurrentBackgroundImage(image);
  }, [location.pathname]); // location.pathname ke change hone par effect chalega

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-300">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">BragBoard Admin</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
            <DashboardIcon className="mr-3" /> Dashboard
          </Link>
          <Link to="/brag-board" className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
            <EmojiEventsIcon className="mr-3" /> Brag Board
          </Link>
          <Link to="/shoutouts" className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
            <CampaignIcon className="mr-3" /> Shout-outs
          </Link>
          <Link to="/members" className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
            <GroupIcon className="mr-3" /> Members
          </Link>
          <Link to="/settings" className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
            <SettingsIcon className="mr-3" /> Settings
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header (same as before) */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Welcome, Admin!</h2>
          <div className="flex items-center gap-4">
            <Avatar email={userEmail} />
            <Button variant="outlined" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>
        
        {/* --- NAYA MAIN CONTENT AREA, BACKGROUND IMAGE KE SAATH --- */}
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto p-6 flex justify-center items-start relative"
          style={{
            backgroundImage: currentBackgroundImage !== 'none' ? `url("${currentBackgroundImage}")` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            // Ek semi-transparent overlay add karein taaki content clear dikhe
            backgroundColor: 'rgba(255, 255, 255, 0.7)', // White overlay
            backgroundBlendMode: 'overlay', // Image ko overlay mode me blend karein
          }}
        >
          {/* Children (jaise ki ShoutoutFeed ya BragBoard content) ko iske andar render karein */}
          {children}
        </main>
        {/* --- END NAYA MAIN CONTENT AREA --- */}
      </div>
    </div>
  );
}

export default Layout;