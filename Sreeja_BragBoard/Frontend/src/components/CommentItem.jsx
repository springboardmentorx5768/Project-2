import { useState } from 'react';
import TimeAgo from 'react-timeago';

const CommentItem = ({ 
  comment, 
  currentUser, 
  onDelete, 
  onReply, 
  level = 0,
  maxNestLevel = 3 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [newReply, setNewReply] = useState('');

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    
    await onReply(comment.id, newReply);
    setNewReply('');
    setShowReplyForm(false);
  };

  return (
    <div className={`relative ${level > 0 ? 'ml-4 pl-4 border-l border-gray-200' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-3 mb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {comment.avatar_url ? (
              <img 
                src={comment.avatar_url} 
                alt={comment.user_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {comment.user_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{comment.user_name}</p>
              <p className="text-xs text-gray-500">{comment.user_department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <TimeAgo date={comment.created_at} className="text-gray-500" />
            {(comment.user_id === currentUser?.id || currentUser?.role === 'admin') && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Delete comment"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mt-2">
          {comment.comment_text}
        </p>
        {level < maxNestLevel && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Reply
            </button>
          </div>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleReply} className="mb-3">
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Write a reply..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            rows="2"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setNewReply('');
                setShowReplyForm(false);
              }}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              disabled={!newReply.trim()}
            >
              Reply
            </button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onDelete={onDelete}
              onReply={onReply}
              level={level + 1}
              maxNestLevel={maxNestLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;