import React from 'react';
import { useAuth } from '../../utils/AuthContext';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const RoleBasedDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-secondary-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-secondary-600">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-4xl mb-4">🤔</div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Unknown Role
            </h2>
            <p className="text-secondary-600 mb-4">
              Your account has an unrecognized role: <strong>{user.role}</strong>
            </p>
            <p className="text-sm text-secondary-500">
              Please contact your administrator to resolve this issue.
            </p>
          </div>
        </div>
      );
  }
};

export default RoleBasedDashboard;