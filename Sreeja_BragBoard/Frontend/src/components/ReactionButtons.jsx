import { useState, useEffect } from 'react';
import api from '../services/api';

const ReactionButtons = ({ shoutoutId, initialCounts, initialUserReaction, onReactionChange }) => {
  const [counts, setCounts] = useState({
    like_count: initialCounts?.like_count || 0,
    clap_count: initialCounts?.clap_count || 0,
    star_count: initialCounts?.star_count || 0
  });
  const [userReaction, setUserReaction] = useState(initialUserReaction || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update counts when props change
  useEffect(() => {
    setCounts({
      like_count: initialCounts?.like_count || 0,
      clap_count: initialCounts?.clap_count || 0,
      star_count: initialCounts?.star_count || 0
    });
    setUserReaction(initialUserReaction || null);
  }, [initialCounts, initialUserReaction]);

  const handleReaction = async (reactionType) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // If clicking same reaction, remove it
      if (userReaction === reactionType) {
        await api.removeReaction(shoutoutId);
        
        // Update local state - decrement the count
        setCounts(prev => ({
          ...prev,
          [`${reactionType}_count`]: Math.max(0, prev[`${reactionType}_count`] - 1)
        }));
        setUserReaction(null);
        
        // Notify parent component
        if (onReactionChange) {
          onReactionChange(shoutoutId, null, {
            ...counts,
            [`${reactionType}_count`]: Math.max(0, counts[`${reactionType}_count`] - 1)
          });
        }
      } else {
        // Add or change reaction
        await api.addReaction(shoutoutId, reactionType);
        
        // Update local state - increment new, decrement old if exists
        const newCounts = { ...counts };
        if (userReaction) {
          newCounts[`${userReaction}_count`] = Math.max(0, newCounts[`${userReaction}_count`] - 1);
        }
        newCounts[`${reactionType}_count`] = newCounts[`${reactionType}_count`] + 1;
        
        setCounts(newCounts);
        setUserReaction(reactionType);
        
        // Notify parent component
        if (onReactionChange) {
          onReactionChange(shoutoutId, reactionType, newCounts);
        }
      }
    } catch (err) {
      console.error('Error handling reaction:', err);
      setError('Failed to update reaction');
      
      // Revert to initial state on error
      setCounts({
        like_count: initialCounts?.like_count || 0,
        clap_count: initialCounts?.clap_count || 0,
        star_count: initialCounts?.star_count || 0
      });
      setUserReaction(initialUserReaction || null);
    } finally {
      setLoading(false);
    }
  };

  const reactionButtons = [
    { type: 'like', emoji: '👍', label: 'Like', activeClass: 'bg-blue-100 text-blue-700 border-blue-400' },
    { type: 'clap', emoji: '👏', label: 'Clap', activeClass: 'bg-green-100 text-green-700 border-green-400' },
    { type: 'star', emoji: '⭐', label: 'Star', activeClass: 'bg-yellow-100 text-yellow-700 border-yellow-400' }
  ];

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
      {error && (
        <div className="text-xs text-red-600 mr-2">
          {error}
        </div>
      )}
      
      {reactionButtons.map(({ type, emoji, label, activeClass }) => {
        const count = counts[`${type}_count`];
        const isActive = userReaction === type;
        
        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={loading}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              transition-all duration-200 transform hover:scale-105
              ${isActive 
                ? `${activeClass} border-2 shadow-md` 
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={`${isActive ? 'Remove' : 'Add'} ${label}`}
          >
            <span className={`text-base ${isActive ? 'animate-bounce' : ''}`}>
              {emoji}
            </span>
            {count > 0 && (
              <span className="font-semibold">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionButtons;
