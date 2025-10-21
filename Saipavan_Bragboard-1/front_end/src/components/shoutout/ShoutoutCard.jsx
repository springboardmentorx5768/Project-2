import React, { useState } from 'react';
import { createComment, toggleReaction } from '../../api/apiService.js';

function ShoutoutCard({ shoutout, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleReaction = async (type) => {
    try {
      await toggleReaction(shoutout.id, { type });
      onUpdate();
    } catch (err) {
      alert('Could not add reaction.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment(shoutout.id, { content: newComment });
      setNewComment('');
      onUpdate();
    } catch (err) {
      alert('Could not post comment.');
    }
  };

  return (
    <div className="shoutout-card">
      <div className="card-header">
        <div className="avatar">{shoutout.sender.name.substring(0, 2).toUpperCase()}</div>
        <div className="sender-info">
          <p className="sender-name">{shoutout.sender.name}</p>
          <p className="timestamp">{new Date(shoutout.created_at).toLocaleString()}</p>
        </div>
      </div>
      <p className="card-body">{shoutout.message}</p>
      <div className="card-footer">
        <button onClick={() => handleReaction('like')}>👍 Like ({shoutout.reactions.filter(r => r.type === 'like').length})</button>
        <button onClick={() => handleReaction('clap')}>👏 Clap ({shoutout.reactions.filter(r => r.type === 'clap').length})</button>
        <button onClick={() => handleReaction('star')}>⭐️ Star ({shoutout.reactions.filter(r => r.type === 'star').length})</button>
        <button onClick={() => setShowComments(!showComments)} className="ml-auto">💬 Comment ({shoutout.comments.length})</button>
      </div>
      {showComments && (
        <div className="comment-section">
          {shoutout.comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="avatar" style={{width: '2rem', height: '2rem', marginRight: '0.75rem'}}>{comment.user.name.substring(0,2).toUpperCase()}</div>
              <div>
                <span className="font-semibold">{comment.user.name}:</span> {comment.content}
              </div>
            </div>
          ))}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="form-input" />
            <button type="submit" className="auth-button" style={{width: 'auto', padding: '0.5rem 1rem'}}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ShoutoutCard;