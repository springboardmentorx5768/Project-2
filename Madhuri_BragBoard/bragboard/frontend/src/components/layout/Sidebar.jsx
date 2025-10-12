import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      roles: ['employee', 'manager', 'admin']
    },
    {
      name: 'My Achievements',
      path: '/achievements/my',
      icon: '🏆',
      roles: ['employee', 'manager', 'admin']
    },
    {
      name: 'All Achievements',
      path: '/achievements',
      icon: '🌟',
      roles: ['employee', 'manager', 'admin']
    },
    {
      name: 'Leaderboard',
      path: '/leaderboard',
      icon: '🥇',
      roles: ['employee', 'manager', 'admin']
    },
    {
      name: 'Team Management',
      path: '/team',
      icon: '👥',
      roles: ['manager', 'admin']
    },
    {
      name: 'Department Analytics',
      path: '/analytics',
      icon: '📈',
      roles: ['manager', 'admin']
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: '👤',
      roles: ['admin']
    },
    {
      name: 'Department Management',
      path: '/admin/departments',
      icon: '🏢',
      roles: ['admin']
    },
    {
      name: 'System Settings',
      path: '/admin/settings',
      icon: '⚙️',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = navItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white min-h-screen border-r border-secondary-200 shadow-sm">
      <div className="p-6">
        {/* User Info */}
        <div className={`
          card p-4 mb-6 border-l-4 
          ${user.role === 'admin' ? 'border-purple-500' : user.role === 'manager' ? 'border-primary-500' : 'border-success-500'}
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
              ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                user.role === 'manager' ? 'bg-primary-100 text-primary-800' : 
                'bg-success-100 text-success-800'}
            `}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-secondary-900 truncate">{user.name}</h3>
              <p className="text-xs text-secondary-500 truncate">
                {user.department_name || 'No Department'}
              </p>
              <span className={`
                badge mt-1 text-xs
                ${user.role === 'admin' ? 'role-admin' : 
                  user.role === 'manager' ? 'role-manager' : 
                  'role-employee'}
              `}>
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <h4 className="text-xs font-medium text-secondary-500 uppercase tracking-wide mb-3">
            Navigation
          </h4>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 card p-4">
          <h4 className="text-xs font-medium text-secondary-500 uppercase tracking-wide mb-3">
            Quick Stats
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-600">Achievements</span>
              <span className="font-medium text-primary-600">{user.achievement_count || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-600">Points</span>
              <span className="font-medium text-success-600">{user.total_points || 0}</span>
            </div>
            {user.role !== 'employee' && (
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Team Size</span>
                <span className="font-medium text-purple-600">{user.team_size || 0}</span>
              </div>
            )}
          </div>
        </div>

        {/* Role-specific actions */}
        {user.role === 'admin' && (
          <div className="mt-6 card p-4">
            <h4 className="text-xs font-medium text-secondary-500 uppercase tracking-wide mb-3">
              Admin Actions
            </h4>
            <div className="space-y-2">
              <button className="btn btn-primary btn-sm w-full text-xs">
                System Overview
              </button>
              <button className="btn btn-secondary btn-sm w-full text-xs">
                Quick Reports
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;