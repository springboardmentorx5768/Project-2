import { useState, useEffect } from 'react';
import api from '../services/api';
import CommentItem from './CommentItem';
import ConfirmDialog from './ConfirmDialog';

const Comments = ({ shoutoutId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    commentToDelete: null,
    title: '',
    message: ''
  });
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, shoutoutId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await api.getComments(shoutoutId);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e, parentId = null) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      setError('');
      const comment = await api.addComment(shoutoutId, newComment, parentId);
      if (parentId) {
        // Update the nested comments structure
        const updateCommentsWithReply = (comments) => {
          return comments.map(c => {
            if (c.id === parentId) {
              return { ...c, replies: [comment, ...(c.replies || [])] };
            }
            if (c.replies) {
              return { ...c, replies: updateCommentsWithReply(c.replies) };
            }
            return c;
          });
        };
        setComments(updateCommentsWithReply(comments));
      } else {
        setComments([comment, ...comments]);
      }
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setConfirmDialog({
      isOpen: true,
      commentToDelete: commentId,
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment? This action cannot be undone.'
    });
  };

  const confirmDeleteComment = async () => {
    const commentId = confirmDialog.commentToDelete;
    if (!commentId) return;

    try {
      await api.deleteComment(commentId);
      // Remove the comment from state, including from replies
      const removeComment = (comments) => {
        return comments.filter(c => {
          if (c.id === commentId) return false;
          if (c.replies) {
            c.replies = removeComment(c.replies);
          }
          return true;
        });
      };
      setComments(removeComment(comments));
      setError('');
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'Failed to delete comment');
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    // Check for @ mention
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowSuggestions(true);
      // In a real app, you'd fetch users here
      // For now, we'll just show a hint
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      {/* Comments Toggle Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="font-medium">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${showComments ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-2">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Add a comment... (Use @ to tag users)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows="2"
                disabled={loading}
              />
              {showSuggestions && (
                <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 text-xs text-gray-600">
                  💡 Tip: Type @username to tag someone
                </div>
              )}
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewComment('')}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading || !newComment.trim()}
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-4 py-1 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !newComment.trim()}
              >
                {loading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {loading && comments.length === 0 ? (
            <div className="text-center py-4">
              <div className="spinner w-6 h-6 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-500">No comments yet</p>
              <p className="text-xs text-gray-400">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Only show top-level comments here */}
              {comments
                .filter(comment => !comment.parent_id)
                .map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUser={currentUser}
                    onDelete={handleDeleteComment}
                    onReply={async (parentId, replyText) => {
                      try {
                        const comment = await api.addComment(shoutoutId, replyText, parentId);
                        await fetchComments(); // Refresh all comments to get the updated structure
                      } catch (err) {
                        setError('Failed to add reply');
                      }
                    }}
                  />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDeleteComment}
      />
    </div>
  );
};

export default Comments;
