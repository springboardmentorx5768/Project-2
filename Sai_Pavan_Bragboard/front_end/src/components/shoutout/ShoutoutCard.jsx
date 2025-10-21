import React, { useState } from 'react';
import { createComment, toggleReaction } from '../../api/apiService.js';

function SafeText(str, fallback = '') {
  try {
    if (typeof str === 'string') return str;
    if (str && typeof str === 'object') return String(str);
    return fallback;
  } catch (e) {
    return fallback;
  }
}

function ShoutoutCard({ shoutout = {}, onUpdate = () => {} }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Resolve sender full name robustly from several possible shapes the backend might return.
  const getSenderName = (s) => {
    if (!s) return 'Unknown';
    // If shoutout has explicit poster fields
    const candidates = [
      s.poster?.full_name,
      s.poster_full_name,
      s.posted_by?.full_name,
      s.posted_by_name,
      s.created_by?.full_name,
      s.created_by_name,
      s.author?.full_name,
      s.author_name,
      s.sender?.full_name,
      s.sender?.name,
      s.user?.full_name,
      s.user?.name,
      s.sender_name,
      s.poster?.name,
      s.sender?.email,
      s.user?.email,
      s.created_by?.email,
    ];

    for (const cand of candidates) {
      if (cand && typeof cand === 'string' && cand.trim()) return cand.trim();
    }

    // If sender/poster is an object with first/last name fields, compose them
    const objSources = [s.sender, s.poster, s.posted_by, s.user, s.created_by, s.author];
    for (const obj of objSources) {
      if (obj && typeof obj === 'object') {
        const first = obj.first_name ?? obj.firstName ?? obj.given_name;
        const last = obj.last_name ?? obj.lastName ?? obj.family_name;
        if (first || last) return `${first ?? ''} ${last ?? ''}`.trim();
      }
    }

    // Fallback to stringification
    if (typeof s.sender === 'string' && s.sender.trim()) return s.sender.trim();
    if (typeof s === 'string' && s.trim()) return s.trim();
    return 'Unknown';
  };

  const senderName = getSenderName(shoutout);
  const createdAt = shoutout?.created_at ?? shoutout?.timestamp ?? shoutout?.createdAt ?? null;

  // Parse date from various shapes; if backend provides a naive ISO string (no timezone)
  // treat it as UTC by appending 'Z' so JS parses it correctly instead of assuming local.
  const parseDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;
    try {
      if (typeof d === 'string') {
        // ISO-like without timezone: YYYY-MM-DDTHH:MM:SS or with milliseconds
        const naiveIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
        if (naiveIso.test(d)) {
          return new Date(d + 'Z'); // treat as UTC
        }
        // otherwise let Date parse (handles timezone-aware strings)
        return new Date(d);
      }
      // number timestamp
      if (typeof d === 'number') return new Date(d);
      return new Date(String(d));
    } catch (e) {
      return null;
    }
  };

  const createdDate = parseDate(createdAt);

  const reactions = Array.isArray(shoutout?.reactions) ? shoutout.reactions : [];
  const comments = Array.isArray(shoutout?.comments) ? shoutout.comments : [];

  const countReaction = (type) => reactions.filter((r) => r?.type === type).length;

  const handleReaction = async (type) => {
    try {
      await toggleReaction(shoutout?.id, { type });
      if (typeof onUpdate === 'function') onUpdate();
    } catch (err) {
      // Don't let a network error crash the whole component
      console.error('toggleReaction error', err);
      alert('Could not add reaction.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment(shoutout?.id, { content: newComment });
      setNewComment('');
      if (typeof onUpdate === 'function') onUpdate();
    } catch (err) {
      console.error('createComment error', err);
      alert('Could not post comment.');
    }
  };

  // Compute initials from full name or email
  const computeInitials = (name) => {
    try {
      if (!name) return 'U';
      const parts = String(name).trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } catch (e) {
      return 'U';
    }
  };

  // Format a Date as a relative time string (e.g. "2h ago").
  const formatRelativeTime = (date) => {
    try {
      const now = Date.now();
      let seconds = Math.floor((now - date.getTime()) / 1000);
      const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

      const minutes = Math.round(seconds / 60);
      if (Math.abs(seconds) < 60) return rtf.format(-seconds, 'second');
      if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');

      const hours = Math.round(minutes / 60);
      if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');

      const days = Math.round(hours / 24);
      if (Math.abs(days) < 7) return rtf.format(-days, 'day');

      const weeks = Math.round(days / 7);
      if (Math.abs(weeks) < 4) return rtf.format(-weeks, 'week');

      const months = Math.round(days / 30);
      if (Math.abs(months) < 12) return rtf.format(-months, 'month');

      const years = Math.round(days / 365);
      return rtf.format(-years, 'year');
    } catch (e) {
      return date.toLocaleString();
    }
  };

  return (
    <div className="shoutout-card">
      <div className="card-header">
        <div className="avatar">{computeInitials(senderName)}</div>
        <div className="sender-info">
          <p className="sender-name">{senderName}</p>
          <p className="timestamp" title={createdDate ? createdDate.toLocaleString() : ''}>
            {createdDate ? formatRelativeTime(createdDate) : ''}
          </p>
        </div>
      </div>
      <p className="card-body">{SafeText(shoutout?.message ?? shoutout?.content ?? '')}</p>
      <div className="card-footer">
        <button onClick={() => handleReaction('like')}>👍 Like ({countReaction('like')})</button>
        <button onClick={() => handleReaction('clap')}>👏 Clap ({countReaction('clap')})</button>
        <button onClick={() => handleReaction('star')}>⭐️ Star ({countReaction('star')})</button>
        <button onClick={() => setShowComments(!showComments)} className="ml-auto">💬 Comment ({comments.length})</button>
      </div>
      {showComments && (
        <div className="comment-section">
          {comments.map((comment) => {
            const author = comment?.user?.full_name ?? comment?.user?.name ?? comment?.author_name ?? comment?.user?.email ?? 'Unknown';
            return (
              <div key={comment?.id ?? Math.random()} className="comment">
                <div className="avatar" style={{ width: '2rem', height: '2rem', marginRight: '0.75rem' }}>
                  {SafeText(computeInitials(author), 'U')}
                </div>
                <div>
                  <span className="font-semibold">{author}:</span> {SafeText(comment?.content ?? comment?.text ?? '')}
                </div>
              </div>
            );
          })}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="form-input" />
            <button type="submit" className="auth-button" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ShoutoutCard;