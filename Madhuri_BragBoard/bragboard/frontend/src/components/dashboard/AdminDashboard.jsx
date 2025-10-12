import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { achievementsAPI, usersAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalAchievements: 0,
    pendingApprovals: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      setStats({
        totalUsers: 156,
        totalDepartments: 12,
        totalAchievements: 892,
        pendingApprovals: 23
      });
      
      setRecentUsers([
        { id: 1, name: 'John Doe', department: 'Engineering', joinedAt: '2024-01-15', role: 'employee' },
        { id: 2, name: 'Jane Smith', department: 'Marketing', joinedAt: '2024-01-14', role: 'manager' },
        { id: 3, name: 'Mike Johnson', department: 'Sales', joinedAt: '2024-01-13', role: 'employee' },
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              👋 Welcome back, {user?.name}!
            </h1>
            <p className="text-secondary-600 mt-1">
              System Administrator Dashboard
            </p>
          </div>
          <div className="badge role-admin">
            Admin
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Users</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="text-3xl text-primary-500">👥</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Departments</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{stats.totalDepartments}</p>
            </div>
            <div className="text-3xl text-success-500">🏢</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Achievements</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">{stats.totalAchievements}</p>
            </div>
            <div className="text-3xl text-warning-500">🏆</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Pending</p>
              <p className="text-2xl font-bold text-error-600 mt-1">{stats.pendingApprovals}</p>
            </div>
            <div className="text-3xl text-error-500">⏰</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Recent Users
          </h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                    <p className="text-xs text-secondary-500">{user.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${user.role === 'manager' ? 'badge-primary' : 'badge-secondary'}`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-secondary-500 mt-1">{user.joinedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="btn btn-primary btn-md w-full justify-start">
              <span className="mr-2">👤</span>
              Manage Users
            </button>
            <button className="btn btn-secondary btn-md w-full justify-start">
              <span className="mr-2">🏢</span>
              Manage Departments
            </button>
            <button className="btn btn-secondary btn-md w-full justify-start">
              <span className="mr-2">🏆</span>
              Review Achievements
            </button>
            <button className="btn btn-secondary btn-md w-full justify-start">
              <span className="mr-2">📊</span>
              System Analytics
            </button>
            <button className="btn btn-secondary btn-md w-full justify-start">
              <span className="mr-2">⚙️</span>
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;