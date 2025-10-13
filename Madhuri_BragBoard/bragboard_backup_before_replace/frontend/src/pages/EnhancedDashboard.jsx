import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { achievementsAPI, departmentsAPI } from '../services/api';
import { Card, Button, Badge, Avatar, LoadingSpinner, Alert } from '../components/ui';

const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`text-3xl text-${color}-500`}>{icon}</div>
    </div>
  </Card>
);

const RecentAchievement = ({ achievement }) => (
  <Card className="p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start space-x-3">
      <Avatar 
        src={achievement.user?.profile_picture}
        alt={achievement.user_name}
        fallback={achievement.user_name?.charAt(0)}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {achievement.title}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2">
          {achievement.description}
        </p>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-gray-500">{achievement.user_name}</span>
          <Badge variant="primary" className="text-xs">
            {achievement.points} pts
          </Badge>
          {achievement.is_featured && (
            <Badge variant="warning" className="text-xs">⭐ Featured</Badge>
          )}
        </div>
      </div>
    </div>
  </Card>
);

const DashboardPage = () => {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  // Role styles for different user roles
  const roleStyles = {
    admin: {
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      accent: 'text-purple-600',
      background: 'bg-purple-50'
    },
    manager: {
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      accent: 'text-blue-600',
      background: 'bg-blue-50'
    },
    employee: {
      badge: 'bg-green-100 text-green-800 border-green-200',
      accent: 'text-green-600',
      background: 'bg-green-50'
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user stats
      const userStats = await achievementsAPI.getMyStats();
      setStats(userStats);

      // Load recent achievements in department
      const achievements = await achievementsAPI.getAchievements({
        department_id: user.department_id,
        limit: 5
      });
      setRecentAchievements(achievements);

      // Load department leaderboard if user has department
      if (user.department_id) {
        const leaderboardData = await achievementsAPI.getDepartmentLeaderboard(
          user.department_id, 
          5
        );
        setLeaderboard(leaderboardData);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const roleConfig = roleStyles[user?.role] || roleStyles.employee;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className={`bg-white rounded-lg p-6 border-l-4 ${roleConfig.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.department_name ? `${user.department_name} Department` : 'No Department Assigned'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Avatar 
              src={user?.profile_picture}
              alt={user?.name}
              fallback={user?.name?.charAt(0)}
              size="lg"
            />
            <div className="text-right">
              <Badge className={roleConfig.badge}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Achievements"
          value={stats?.total_count || 0}
          subtitle="Total earned"
          icon="🏆"
          color="blue"
        />
        <StatCard
          title="Total Points"
          value={stats?.total_points || 0}
          subtitle="Points earned"
          icon="⭐"
          color="yellow"
        />
        <StatCard
          title="Featured"
          value={stats?.featured_count || 0}
          subtitle="Featured achievements"
          icon="🌟"
          color="purple"
        />
        <StatCard
          title="Department Rank"
          value={leaderboard.findIndex(item => item.id === user?.id) + 1 || '-'}
          subtitle="In leaderboard"
          icon="🥇"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Department Achievements
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentAchievements.length > 0 ? (
              recentAchievements.map((achievement) => (
                <RecentAchievement 
                  key={achievement.id} 
                  achievement={achievement} 
                />
              ))
            ) : (
              <Card className="p-6 text-center">
                <div className="text-gray-400 text-4xl mb-2">🏆</div>
                <p className="text-gray-600">No recent achievements</p>
                <p className="text-sm text-gray-500 mt-1">
                  Be the first to add an achievement!
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Department Leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Department Leaderboard
            </h2>
            <Button variant="outline" size="sm">
              View Full
            </Button>
          </div>
          <Card className="p-6">
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'}
                      `}>
                        {index + 1}
                      </span>
                      <Avatar 
                        alt={user.name}
                        fallback={user.name?.charAt(0)}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.achievement_count} achievements
                        </p>
                      </div>
                    </div>
                    <Badge variant="primary">
                      {user.total_points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-2">🥇</div>
                <p className="text-gray-600">No leaderboard data</p>
                <p className="text-sm text-gray-500 mt-1">
                  Start earning achievements to appear here!
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" className="justify-center">
            🏆 Add Achievement
          </Button>
          <Button variant="outline" className="justify-center">
            📊 View Analytics
          </Button>
          {hasAnyRole(['manager', 'admin']) && (
            <Button variant="outline" className="justify-center">
              👥 Manage Team
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;