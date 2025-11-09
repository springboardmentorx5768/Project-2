import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getCurrentUserProfile } from '../../api/apiService.js';

function TopNavbar() {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

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

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    try {
      logout();
    } catch (e) {
      localStorage.removeItem('token');
    }
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="top-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <div className="date-time-display">
            <div className="current-date">{formatDate(currentTime)}</div>
            <div className="current-time">{formatTime(currentTime)}</div>
          </div>
        </div>
        
        <div className="navbar-center">
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="user-welcome">
              <div className="welcome-text">
                <span className="greeting">{getGreeting()}</span>
                <span className="user-name">{user.full_name ?? user.email}</span>
              </div>
              <div className="user-avatar">
                {(user.full_name ?? user.email).charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="loading-user">
              <div className="loading-skeleton"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;