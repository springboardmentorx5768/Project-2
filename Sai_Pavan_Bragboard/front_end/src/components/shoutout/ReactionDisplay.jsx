import React, { useState } from 'react';
import './ReactionDisplay.css';

const ReactionDisplay = ({ reactions = [], onToggleReaction, currentUserId }) => {
  const [hoveredReaction, setHoveredReaction] = useState(null);
  
  // Ensure reactions is an array and safe to use
  const safeReactions = Array.isArray(reactions) ? reactions : [];
  
  // Count each type manually - this approach avoids any object rendering issues
  let likesCount = 0;
  let clapsCount = 0;
  let starsCount = 0;
  
  // Group reactions by type for tooltips
  const likeReactions = [];
  const clapReactions = [];
  const starReactions = [];
  
  safeReactions.forEach(reaction => {
    if (reaction && reaction.type === 'like') {
      likesCount++;
      likeReactions.push(reaction);
    }
    if (reaction && reaction.type === 'clap') {
      clapsCount++;
      clapReactions.push(reaction);
    }
    if (reaction && reaction.type === 'star') {
      starsCount++;
      starReactions.push(reaction);
    }
  });
  
  // Check if current user reacted
  const userLiked = likeReactions.some(r => r.user_id === currentUserId);
  const userClapped = clapReactions.some(r => r.user_id === currentUserId);
  const userStarred = starReactions.some(r => r.user_id === currentUserId);

  const handleClick = (type) => {
    if (typeof onToggleReaction === 'function') {
      onToggleReaction(type);
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (error) {
      return 'recently';
    }
  };

  const getUserInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderTooltip = (reactionType, users) => {
    if (!hoveredReaction || hoveredReaction !== reactionType || users.length === 0) {
      return null;
    }

    const reactionLabels = {
      like: { emoji: '👍', label: 'Liked' },
      clap: { emoji: '👏', label: 'Clapped' },
      star: { emoji: '⭐️', label: 'Starred' }
    };

    return (
      <div className="reaction-tooltip">
        <div className="reaction-tooltip-content">
          <div className="reaction-tooltip-header">
            <span>{reactionLabels[reactionType].emoji}</span>
            <span>{reactionLabels[reactionType].label} by {users.length} {users.length === 1 ? 'person' : 'people'}</span>
          </div>
          <div className="reaction-tooltip-users">
            {users.map((reaction, index) => (
              <div key={`${reaction.user_id}-${index}`} className="reaction-user-item">
                <div className="reaction-user-avatar">
                  {getUserInitials(reaction.user?.full_name)}
                </div>
                <div className="reaction-user-info">
                  <div className="reaction-user-name">
                    {reaction.user?.full_name || 'Unknown User'}
                  </div>
                  <div className="reaction-user-time">
                    {formatTimeAgo(reaction.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="enhanced-reactions">
      <div className="reaction-button-container">
        <button 
          className={`reaction-button ${userLiked ? 'reacted' : ''}`}
          onClick={() => handleClick('like')}
          onMouseEnter={() => setHoveredReaction('like')}
          onMouseLeave={() => setHoveredReaction(null)}
        >
          <span className="reaction-emoji">👍</span>
          <span className="reaction-label">Like</span>
          {likesCount > 0 && (
            <span className="reaction-count">({likesCount})</span>
          )}
        </button>
        {renderTooltip('like', likeReactions)}
      </div>
      
      <div className="reaction-button-container">
        <button 
          className={`reaction-button ${userClapped ? 'reacted' : ''}`}
          onClick={() => handleClick('clap')}
          onMouseEnter={() => setHoveredReaction('clap')}
          onMouseLeave={() => setHoveredReaction(null)}
        >
          <span className="reaction-emoji">👏</span>
          <span className="reaction-label">Clap</span>
          {clapsCount > 0 && (
            <span className="reaction-count">({clapsCount})</span>
          )}
        </button>
        {renderTooltip('clap', clapReactions)}
      </div>
      
      <div className="reaction-button-container">
        <button 
          className={`reaction-button ${userStarred ? 'reacted' : ''}`}
          onClick={() => handleClick('star')}
          onMouseEnter={() => setHoveredReaction('star')}
          onMouseLeave={() => setHoveredReaction(null)}
        >
          <span className="reaction-emoji">⭐️</span>
          <span className="reaction-label">Star</span>
          {starsCount > 0 && (
            <span className="reaction-count">({starsCount})</span>
          )}
        </button>
        {renderTooltip('star', starReactions)}
      </div>
    </div>
  );
};

export default ReactionDisplay;