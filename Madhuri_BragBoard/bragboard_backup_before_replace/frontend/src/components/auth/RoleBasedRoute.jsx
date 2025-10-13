import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

/**
 * Role-based route protection component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles that can access this route
 * @param {string} props.redirectTo - Path to redirect to if not authorized (default: '/dashboard')
 * @param {React.ReactNode} props.fallback - Component to show if not authorized (instead of redirect)
 */
const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/dashboard',
  fallback = null 
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no user data yet, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    if (fallback) {
      return fallback;
    }
    
    // Show unauthorized message
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 text-error-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            Access Denied
          </h2>
          <p className="text-secondary-600 mb-4">
            You don't have permission to access this page. Required roles: {allowedRoles.join(', ')}
          </p>
          <p className="text-sm text-secondary-500">
            Your role: <span className="font-medium">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute;