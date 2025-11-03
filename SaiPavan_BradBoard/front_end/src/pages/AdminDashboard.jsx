import React, { useState, useEffect } from 'react';
import { getShoutouts } from '../api/apiService.js';

function AdminDashboard() {
  const [shoutouts, setShoutouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalShoutouts: 0,
    totalUsers: 0,
    totalReactions: 0,
    totalComments: 0,
    activeUsers: 0,
    recentActivity: []
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const data = await getShoutouts();
        setShoutouts(data);
        
        // Calculate admin statistics
        const totalReactions = data.reduce((acc, shoutout) => 
          acc + (shoutout.reactions?.length || 0), 0);
        const totalComments = data.reduce((acc, shoutout) => 
          acc + (shoutout.comments?.length || 0), 0);
        
        // Get unique users (this is a simplified version)
        const uniqueUsers = new Set();
        data.forEach(shoutout => {
          if (shoutout.sender?.email) uniqueUsers.add(shoutout.sender.email);
        });
        
        setAdminStats({
          totalShoutouts: data.length,
          totalUsers: uniqueUsers.size,
          totalReactions,
          totalComments,
          activeUsers: uniqueUsers.size, // Simplified - should be users active in last 30 days
          recentActivity: data.slice(0, 5) // Last 5 activities
        });
      } catch (err) {
        console.error('Failed fetching admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="loading-state">
          <h2>Loading Admin Dashboard...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage and monitor your team's recognition activities</p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{adminStats.totalShoutouts}</div>
              <div className="stat-label">Total Shout-outs</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{adminStats.totalUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <div className="stat-value">{adminStats.totalReactions}</div>
              <div className="stat-label">Total Reactions</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <div className="stat-value">{adminStats.totalComments}</div>
              <div className="stat-label">Comments</div>
            </div>
          </div>
        </div>

        <div className="admin-content-grid">
          <div className="admin-panel">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {adminStats.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-avatar">
                    {(activity.sender?.full_name || activity.sender?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="activity-details">
                    <div className="activity-user">
                      {activity.sender?.full_name || activity.sender?.email || 'Unknown User'}
                    </div>
                    <div className="activity-action">
                      Created a new shout-out
                    </div>
                    <div className="activity-time">
                      {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>
              ))}
              {adminStats.recentActivity.length === 0 && (
                <div className="no-activity">No recent activity</div>
              )}
            </div>
          </div>

          <div className="admin-panel">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-button">
                <span className="action-icon">📈</span>
                View Analytics
              </button>
              <button className="action-button">
                <span className="action-icon">🛡️</span>
                Moderate Content
              </button>
              <button className="action-button">
                <span className="action-icon">👥</span>
                Manage Users
              </button>
              <button className="action-button">
                <span className="action-icon">⚙️</span>
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
