import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getCurrentUserProfile } from '../../api/apiService.js';

function TopNavbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUserProfile();
        setUser(userData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const navigate = useNavigate();
  const { logout } = useAuth();
  // Logout is provided in the sidebar; keep function here if other components call it
  const handleLogout = () => {
    try {
      logout();
    } catch (e) {
      localStorage.removeItem('token');
    }
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div className="top-welcome-container">
        <div className="top-welcome-wrapper">
          {user ? (
            <p className="top-welcome">Welcome, {user.full_name ?? user.email}! 👋</p>
          ) : (
            <p className="top-welcome">Loading user...</p>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;