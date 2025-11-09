import React, { useState, useEffect } from 'react';
import { getMyShoutouts } from '../api/apiService.js';
import ShoutoutCard from '../components/shoutout/ShoutoutCard.jsx';

function MyShoutoutsPage() {
  const [shoutouts, setShoutouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ sent: 0, reactions: 0, comments: 0 });

  const fetchMyShoutouts = async () => {
    try {
      setIsLoading(true);
      const data = await getMyShoutouts();
      setShoutouts(data);
      
      // Calculate stats for my shoutouts
      const totalReactions = data.reduce((acc, shoutout) => {
        const reactions = shoutout.reactions || [];
        return acc + (Array.isArray(reactions) ? reactions.length : 0);
      }, 0);
      
      const totalComments = data.reduce((acc, shoutout) => 
        acc + (shoutout.comments?.length || 0), 0);
      
      setStats({
        sent: data.length,
        reactions: totalReactions,
        comments: totalComments
      });
    } catch (error) {
      console.error('Failed to fetch my shoutouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShoutouts();
  }, []);

  const renderLoadingState = () => (
    <div className="loading-state">
      {[1, 2, 3].map(i => (
        <div key={i} className="shoutout-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-info">
              <div className="skeleton-line skeleton-name"></div>
              <div className="skeleton-line skeleton-time"></div>
            </div>
          </div>
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-text-1"></div>
            <div className="skeleton-line skeleton-text-2"></div>
            <div className="skeleton-line skeleton-text-3"></div>
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">📝</div>
      <h3>No posts yet</h3>
      <p>Create your first shout-out to get started</p>
      <button 
        className="button"
        onClick={() => window.location.href = '/create-shoutout'}
      >
        Create Shout-Out
      </button>
    </div>
  );

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="header-content">
          <h1>My Posts</h1>
          <p className="subtitle">Your shout-outs and their engagement</p>
        </div>
        
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.sent}</div>
            <div className="stat-label">Shout-outs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.reactions}</div>
            <div className="stat-label">Reactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.comments}</div>
            <div className="stat-label">Comments</div>
          </div>
        </div>
      </div>

      <div className="content-body">
        {isLoading ? (
          renderLoadingState()
        ) : shoutouts.length > 0 ? (
          <div className="shoutouts-feed">
            {shoutouts.map((item) => (
              <ShoutoutCard 
                key={item.id} 
                shoutout={item} 
                showDelete={true}
                onUpdate={fetchMyShoutouts} 
              />
            ))}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </main>
  );
}
export default MyShoutoutsPage;