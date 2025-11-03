import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="text-2xl font-bold text-violet-600">
          
        </Link>
        <div>
          {isAuthenticated ? (
            <>
              <span className="text-slate-600 font-medium mr-4"></span>
             
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-violet-600 font-medium px-4 py-2">Login</Link>
              <Link to="/register" className="text-slate-600 hover:text-violet-600 font-medium px-4 py-2">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;