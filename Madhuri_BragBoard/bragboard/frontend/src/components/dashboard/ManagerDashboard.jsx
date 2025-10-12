import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { achievementsAPI } from '../../services/api';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    teamSize: 0,
    departmentAchievements: 0,
    pendingReviews: 0,
    avgPoints: 0
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      setStats({
        teamSize: 12,
        departmentAchievements: 45,
        pendingReviews: 3,
        avgPoints: 1250
      });
      
      setTeamMembers([
        { id: 1, name: 'Alice Johnson', points: 1500, achievements: 8, status: 'active' },
        { id: 2, name: 'Bob Smith', points: 1200, achievements: 6, status: 'active' },
        { id: 3, name: 'Carol Davis', points: 1800, achievements: 12, status: 'active' },
        { id: 4, name: 'David Wilson', points: 900, achievements: 4, status: 'active' },
      ]);

      setRecentAchievements([
        { id: 1, title: 'Project Excellence', user: 'Alice Johnson', points: 200, date: '2024-01-15' },
        { id: 2, title: 'Team Collaboration', user: 'Bob Smith', points: 150, date: '2024-01-14' },
        { id: 3, title: 'Innovation Award', user: 'Carol Davis', points: 300, date: '2024-01-13' },
      ]);
    } catch (error) {
      console.error('Failed to load manager data:', error);
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
      <div className="card p-6 border-l-4 border-primary-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              👋 Welcome back, {user?.name}!
            </h1>
            <p className="text-secondary-600 mt-1">
              {user?.department_name || 'Department'} Manager Dashboard
            </p>
          </div>
          <div className="badge role-manager">
            Manager
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Team Size</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">{stats.teamSize}</p>
            </div>
            <div className="text-3xl text-primary-500">👥</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Achievements</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{stats.departmentAchievements}</p>
            </div>
            <div className="text-3xl text-success-500">🏆</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">{stats.pendingReviews}</p>
            </div>
            <div className="text-3xl text-warning-500">⏰</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Avg Points</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.avgPoints}</p>
            </div>
            <div className="text-3xl text-purple-500">⭐</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Team Performance
          </h2>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">{member.name}</p>
                    <p className="text-xs text-secondary-500">{member.achievements} achievements</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-600">{member.points} pts</p>
                  <div className="w-2 h-2 rounded-full bg-success-500 ml-auto mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Department Achievements */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Recent Achievements
          </h2>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="p-3 rounded-lg bg-secondary-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-secondary-900">{achievement.title}</h4>
                    <p className="text-xs text-secondary-500 mt-1">by {achievement.user}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-success">+{achievement.points} pts</span>
                    <p className="text-xs text-secondary-500 mt-1">{achievement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Manager Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary btn-md justify-start">
            <span className="mr-2">🏆</span>
            Review Achievements
          </button>
          <button className="btn btn-secondary btn-md justify-start">
            <span className="mr-2">👥</span>
            Manage Team
          </button>
          <button className="btn btn-secondary btn-md justify-start">
            <span className="mr-2">📊</span>
            Department Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;