import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { achievementsAPI } from '../../services/api';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAchievements: 0,
    totalPoints: 0,
    featuredCount: 0,
    departmentRank: 0
  });
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [departmentLeaderboard, setDepartmentLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Load user stats
      const userStats = await achievementsAPI.getMyStats();
      setStats(userStats);

      // Mock data for recent achievements
      setRecentAchievements([
        { id: 1, title: 'Code Review Champion', points: 100, date: '2024-01-15', featured: true },
        { id: 2, title: 'Team Player', points: 75, date: '2024-01-12', featured: false },
        { id: 3, title: 'Innovation Contributor', points: 150, date: '2024-01-10', featured: true },
      ]);

      // Mock leaderboard data
      setDepartmentLeaderboard([
        { id: 1, name: 'Sarah Wilson', points: 2100, rank: 1, isCurrentUser: false },
        { id: 2, name: 'Mike Chen', points: 1950, rank: 2, isCurrentUser: false },
        { id: 3, name: user?.name, points: userStats.total_points, rank: 3, isCurrentUser: true },
        { id: 4, name: 'Emily Brown', points: 1650, rank: 4, isCurrentUser: false },
        { id: 5, name: 'James Davis', points: 1400, rank: 5, isCurrentUser: false },
      ]);

    } catch (error) {
      console.error('Failed to load employee data:', error);
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
      <div className="card p-6 border-l-4 border-success-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              👋 Welcome back, {user?.name}!
            </h1>
            <p className="text-secondary-600 mt-1">
              {user?.department_name ? `${user.department_name} Department` : 'Ready to achieve great things!'}
            </p>
          </div>
          <div className="badge role-employee">
            Employee
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">My Achievements</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">{stats.total_count}</p>
              <p className="text-xs text-secondary-500 mt-1">Total earned</p>
            </div>
            <div className="text-3xl text-primary-500">🏆</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Points</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{stats.total_points}</p>
              <p className="text-xs text-secondary-500 mt-1">Points earned</p>
            </div>
            <div className="text-3xl text-success-500">⭐</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Featured</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">{stats.featured_count}</p>
              <p className="text-xs text-secondary-500 mt-1">Featured achievements</p>
            </div>
            <div className="text-3xl text-warning-500">⭐</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Department Rank</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">#3</p>
              <p className="text-xs text-secondary-500 mt-1">In leaderboard</p>
            </div>
            <div className="text-3xl text-purple-500">🥇</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Recent Achievements */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">
              My Recent Achievements
            </h2>
            <button className="btn btn-secondary btn-sm">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentAchievements.length > 0 ? (
              recentAchievements.map((achievement) => (
                <div key={achievement.id} className="p-3 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-secondary-900">{achievement.title}</h4>
                      <p className="text-xs text-secondary-500 mt-1">{achievement.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <span className="badge badge-success">+{achievement.points} pts</span>
                        {achievement.featured && (
                          <span className="badge badge-warning">⭐ Featured</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-secondary-600">No achievements yet</p>
                <p className="text-sm text-secondary-500 mt-1">
                  Start earning achievements to see them here!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Department Leaderboard */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">
              Department Leaderboard
            </h2>
            <button className="btn btn-secondary btn-sm">
              View Full
            </button>
          </div>
          <div className="space-y-3">
            {departmentLeaderboard.map((member) => (
              <div 
                key={member.id} 
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  member.isCurrentUser 
                    ? 'bg-primary-50 border border-primary-200' 
                    : 'bg-secondary-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${member.rank === 1 ? 'bg-warning-100 text-warning-800' : 
                      member.rank === 2 ? 'bg-secondary-100 text-secondary-800' :
                      member.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-primary-100 text-primary-800'}
                  `}>
                    {member.rank}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${member.isCurrentUser ? 'text-primary-900' : 'text-secondary-900'}`}>
                      {member.name} {member.isCurrentUser && '(You)'}
                    </p>
                  </div>
                </div>
                <span className="badge badge-primary">
                  {member.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary btn-md justify-start">
            <span className="mr-2">🏆</span>
            Add Achievement
          </button>
          <button className="btn btn-secondary btn-md justify-start">
            <span className="mr-2">📊</span>
            View My Progress
          </button>
          <button className="btn btn-secondary btn-md justify-start">
            <span className="mr-2">🥇</span>
            Browse Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;