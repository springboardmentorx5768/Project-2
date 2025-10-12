import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏆</span>
              </div>
              <span className="text-xl font-bold text-secondary-900">BragBoard</span>
            </Link>
            
            {/* Navigation - Only show if authenticated and has user data */}
            {isAuthenticated && user && (
              <nav className="hidden md:flex space-x-6 ml-8">
                <Link 
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' 
                      ? 'text-primary-600' 
                      : 'text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/achievements"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/achievements' 
                      ? 'text-primary-600' 
                      : 'text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  Achievements
                </Link>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <Link 
                    to="/team"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/team' 
                        ? 'text-primary-600' 
                        : 'text-secondary-600 hover:text-primary-600'
                    }`}
                  >
                    Team
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link 
                    to="/admin/users"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin') 
                        ? 'text-primary-600' 
                        : 'text-secondary-600 hover:text-primary-600'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-3">
                  {/* User Avatar */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'manager' ? 'bg-primary-100 text-primary-800' : 
                      'bg-success-100 text-success-800'}
                  `}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  
                  {/* User Info */}
                  <div className="hidden md:block">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-secondary-900">
                        {user.name}
                      </span>
                      <span className={`
                        badge text-xs
                        ${user.role === 'admin' ? 'role-admin' : 
                          user.role === 'manager' ? 'role-manager' : 
                          'role-employee'}
                      `}>
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-secondary-500">
                      {user.department_name || 'No Department'}
                    </p>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  {/* Notifications */}
                  <button className="btn btn-secondary btn-sm p-2">
                    <span className="text-lg">🔔</span>
                  </button>
                  
                  {/* Quick Add Achievement */}
                  <button className="btn btn-primary btn-sm">
                    <span className="mr-1">🏆</span>
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
                
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                >
                  <span className="mr-1">🚪</span>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              /* Guest Navigation */
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-secondary-600 hover:text-secondary-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;