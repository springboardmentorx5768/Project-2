import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createComment, toggleReaction, deleteShoutout, reportShoutout, __API_URL__ } from '../../api/apiService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import ReactionDisplay from './ReactionDisplay.jsx';

function SafeText(str, fallback = '') {
  try {
    if (typeof str === 'string') return str;
    if (str && typeof str === 'object') return String(str);
    return fallback;
  } catch (e) {
    return fallback;
  }
}

function ShoutoutCard({ shoutout = {}, onUpdate = () => {}, showDelete = false }) {
  const { user: currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [currentLightboxImage, setCurrentLightboxImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Backend user model uses `full_name` and `email` fields
  const senderName = shoutout?.sender?.full_name ?? shoutout?.sender?.name ?? shoutout?.user?.full_name ?? shoutout?.user?.name ?? shoutout?.sender_name ?? shoutout?.sender?.email ?? SafeText(shoutout?.sender, 'Unknown');
  const senderDepartment = shoutout?.sender?.department ?? shoutout?.user?.department ?? shoutout?.department ?? null;
  const senderId = shoutout?.sender?.id ?? shoutout?.user?.id ?? null;
  const createdAt = shoutout?.created_at ?? shoutout?.timestamp ?? shoutout?.createdAt ?? null;

  // Format timestamp to relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Parse the ISO datetime string (should now include proper timezone info)
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return '';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      // Handle future dates (small clock skew tolerance)
      if (diffInSeconds < -60) {
        // More than 1 minute in future, show actual date
        return date.toLocaleDateString();
      } else if (diffInSeconds < 0) {
        return 'Just now';
      }
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      } else {
        // For older posts, show the actual date
        return date.toLocaleDateString();
      }
    } catch (e) {
      console.warn('Error formatting timestamp:', dateString, e);
      return '';
    }
  };

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

  const handleDelete = async () => {
    try {
      await deleteShoutout(shoutout?.id);
      if (typeof onUpdate === 'function') onUpdate();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('deleteShoutout error', err);
      alert('Could not delete shoutout.');
    }
  };

  const handleReport = async () => {
    if (reported || isReporting) return;
    const reason = window.prompt('Report reason (optional):', 'Inappropriate content');
    if (reason === null) return; // user canceled
    try {
      setIsReporting(true);
      await reportShoutout(shoutout?.id, reason || 'Reported');
      setReported(true);
      alert('Thanks. This shout-out has been reported to admins.');
    } catch (err) {
      console.error('reportShoutout error', err);
      alert(err.message || 'Could not submit report.');
    } finally {
      setIsReporting(false);
    }
  };

  // Function to render message with highlighted mentions
  const renderMessageWithMentions = (message) => {
    if (!message) return '';
    
    // Regular expression to find @mentions
    const mentionRegex = /@([A-Za-z\s]+?)(?=\s|$|[.!?])/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(message.substring(lastIndex, match.index));
      }
      
      // Add the highlighted mention
      parts.push(
        <span key={match.index} className="mention-highlight">
          @{match[1].trim()}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last mention
    if (lastIndex < message.length) {
      parts.push(message.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : message;
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

  // Render single attachment (from new attachments array)
  const renderSingleAttachment = (attachment) => {
    if (attachment.file_type === 'image') {
      return (
        <div className="image-attachment">
          <div className="image-container">
            {!imageLoaded && (
              <div className="image-loading-skeleton">
                <div className="skeleton-pulse"></div>
              </div>
            )}
            <img 
              src={`${__API_URL__}${attachment.file_url}`} 
              alt={attachment.filename || 'Attachment'}
              className={`attachment-image ${imageLoaded ? 'loaded' : 'loading'}`}
              onClick={() => openAttachmentLightbox(attachment)}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
            <div className="image-overlay">
              <div className="image-overlay-content">
                <svg className="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>Click to expand</span>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="file-attachment">
          <div className="file-attachment-info">
            <div className="file-attachment-icon">
              {attachment.file_type === 'pdf' ? (
                <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              ) : (
                <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M16,0H8C6.9,0 6,0.9 6,2V22C6,23.1 6.9,24 8,24H16C17.1,24 18,23.1 18,22V2C18,0.9 17.1,0 16,0Z" />
                </svg>
              )}
            </div>
            <div className="file-attachment-details">
              <div className="file-attachment-name">{attachment.filename || 'Attachment'}</div>
              <div className="file-attachment-size">
                {attachment.file_size ? `${Math.round(attachment.file_size / 1024)} KB` : ''}
              </div>
            </div>
            <a 
              href={`${__API_URL__}${attachment.file_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="file-attachment-download"
              title="Download file"
            >
              <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
              </svg>
            </a>
          </div>
        </div>
      );
    }
  };

  // Render legacy attachment (backward compatibility)
  const renderLegacyAttachment = (shoutout) => {
    if (shoutout.attachment_type === 'image') {
      return (
        <div className="image-attachment">
          <div className="image-container">
            {!imageLoaded && (
              <div className="image-loading-skeleton">
                <div className="skeleton-pulse"></div>
              </div>
            )}
            <img 
              src={`${__API_URL__}${shoutout.attachment_url}`} 
              alt={shoutout.attachment_filename || 'Attachment'}
              className={`attachment-image ${imageLoaded ? 'loaded' : 'loading'}`}
              onClick={() => {
                setCurrentLightboxImage({
                  file_url: shoutout.attachment_url,
                  filename: shoutout.attachment_filename || 'Attachment'
                });
                setShowImageLightbox(true);
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
            <div className="image-overlay">
              <div className="image-overlay-content">
                <svg className="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>Click to expand</span>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="file-attachment">
          <div className="file-attachment-info">
            <div className="file-attachment-icon">
              {shoutout.attachment_type === 'pdf' ? (
                <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              ) : (
                <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M16,0H8C6.9,0 6,0.9 6,2V22C6,23.1 6.9,24 8,24H16C17.1,24 18,23.1 18,22V2C18,0.9 17.1,0 16,0Z" />
                </svg>
              )}
            </div>
            <div className="file-attachment-details">
              <div className="file-attachment-name">{shoutout.attachment_filename || 'Attachment'}</div>
              <div className="file-attachment-size">
                {shoutout.attachment_size ? `${Math.round(shoutout.attachment_size / 1024)} KB` : ''}
              </div>
            </div>
            <a 
              href={`${__API_URL__}${shoutout.attachment_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="file-attachment-download"
              title="Download file"
            >
              <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
              </svg>
            </a>
          </div>
        </div>
      );
    }
  };

  // Handle opening attachment lightbox
  const openAttachmentLightbox = (attachment) => {
    if (attachment.file_type === 'image') {
      setCurrentLightboxImage(attachment);
      setShowImageLightbox(true);
    }
  };

  // Handle downloading attachment
  const downloadAttachment = (attachment) => {
    const link = document.createElement('a');
  link.href = `${__API_URL__}${attachment.file_url}`;
    link.download = attachment.filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="shoutout-card">
      <div className="card-header">
        {senderId ? (
          <Link className="avatar" to={`/users/${senderId}`} title="View profile" aria-label={`View ${senderName}'s profile`}>{computeInitials(senderName)}</Link>
        ) : (
          <div className="avatar">{computeInitials(senderName)}</div>
        )}
        <div className="sender-info">
          <p className="sender-row">
            {senderId ? (
              <Link className="sender-link" to={`/users/${senderId}`} title={`View ${senderName}'s profile`} aria-label={`View ${senderName}'s profile`}>
                {senderName}
              </Link>
            ) : (
              <span className="sender-link sender-link--static">{senderName}</span>
            )}
            {senderDepartment && (
              <span className="sender-badge" aria-label={`Department ${senderDepartment}`}>{senderDepartment}</span>
            )}
          </p>
          <p className="timestamp" title={createdAt ? new Date(createdAt).toLocaleString() : ''}>{formatRelativeTime(createdAt)}</p>
        </div>
        {showDelete && (
          <div className="shoutout-actions">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="delete-button"
              title="Delete Shoutout"
            >
              🗑️
            </button>
          </div>
        )}
        {!showDelete && (
          <div className="shoutout-actions">
            <button
              onClick={handleReport}
              className="report-button"
              title={reported ? 'Reported' : 'Report Shoutout'}
              disabled={reported || isReporting}
              style={{ opacity: reported || isReporting ? 0.6 : 1 }}
            >
              {reported ? '✅' : '🚩'}
            </button>
          </div>
        )}
      </div>
      <p className="card-body">
        {renderMessageWithMentions(SafeText(shoutout?.message ?? shoutout?.content ?? ''))}
      </p>
      
      {/* Attachment Display - Support both legacy single attachment and new multiple attachments */}
      {(shoutout?.attachments?.length > 0 || shoutout?.attachment_url) && (
        <div className="attachment-display">
          {/* New multiple attachments */}
          {shoutout?.attachments?.length > 0 ? (
            <div className="attachments-container">
              {shoutout.attachments.length === 1 ? (
                // Single attachment from new system
                <div className="single-attachment">
                  {renderSingleAttachment(shoutout.attachments[0])}
                </div>
              ) : (
                // Multiple attachments
                <div className="multiple-attachments">
                  <div className="attachments-header">
                    <span className="attachments-count">{shoutout.attachments.length} attachments</span>
                  </div>
                  <div className="attachments-grid">
                    {shoutout.attachments.slice(0, 3).map((attachment, index) => (
                      <div key={attachment.id || index} className="attachment-item">
                        {attachment.file_type === 'image' ? (
                          <div className="attachment-thumbnail">
                            <img 
                              src={`${__API_URL__}${attachment.file_url}`}
                              alt={attachment.filename}
                              className="thumbnail-image"
                              onClick={() => openAttachmentLightbox(attachment)}
                            />
                          </div>
                        ) : (
                          <div className="file-thumbnail" onClick={() => downloadAttachment(attachment)}>
                            <div className="file-icon">
                              {attachment.file_type === 'pdf' ? '📄' : '📎'}
                            </div>
                            <div className="file-name">{attachment.filename}</div>
                          </div>
                        )}
                      </div>
                    ))}
                    {shoutout.attachments.length > 3 && (
                      <div className="attachment-item more-attachments">
                        <div className="more-count">
                          +{shoutout.attachments.length - 3} more
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : shoutout?.attachment_url && (
            // Legacy single attachment support
            <div className="legacy-attachment">
              {renderLegacyAttachment(shoutout)}
            </div>
          )}
        </div>
      )}
      
      <div className="card-footer">
        <ReactionDisplay 
          reactions={reactions}
          onToggleReaction={handleReaction}
          currentUserId={currentUser?.id}
        />
        <button onClick={() => setShowComments(!showComments)} className="ml-auto">💬 Comment ({comments.length})</button>
      </div>
      {showComments && (
        <div className="comment-section">
          {comments.map((comment) => {
            const author = comment?.user?.full_name ?? comment?.user?.name ?? comment?.author_name ?? comment?.user?.email ?? 'Unknown';
            const authorId = comment?.user?.id ?? null;
            return (
              <div key={comment?.id ?? Math.random()} className="comment">
                {authorId ? (
                  <Link className="avatar" to={`/users/${authorId}`} title={`View ${author}'s profile`} aria-label={`View ${author}'s profile`} style={{ width: '2rem', height: '2rem', marginRight: '0.75rem' }}>
                    {SafeText(computeInitials(author), 'U')}
                  </Link>
                ) : (
                  <div className="avatar" style={{ width: '2rem', height: '2rem', marginRight: '0.75rem' }}>
                    {SafeText(computeInitials(author), 'U')}
                  </div>
                )}
                <div>
                  {authorId ? (
                    <span className="font-semibold"><Link to={`/users/${authorId}`} title={`View ${author}'s profile`} aria-label={`View ${author}'s profile`}>{author}</Link>:</span>
                  ) : (
                    <span className="font-semibold">{author}:</span>
                  )}
                  {' '}{SafeText(comment?.content ?? comment?.text ?? '')}
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h3>Delete Shoutout</h3>
            <p>Are you sure you want to delete this shoutout? This action cannot be undone.</p>
            <div className="delete-confirmation-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="confirm-delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showImageLightbox && currentLightboxImage && (
        <div className="image-lightbox-overlay" onClick={() => setShowImageLightbox(false)}>
          <div className="image-lightbox-container">
            <button 
              className="image-lightbox-close"
              onClick={() => setShowImageLightbox(false)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={`${__API_URL__}${currentLightboxImage.file_url}`}
              alt={currentLightboxImage.filename || 'Attachment'}
              className="image-lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="image-lightbox-info">
              <div className="image-lightbox-filename">
                {currentLightboxImage.filename || 'Image'}
              </div>
              <a 
                href={`${__API_URL__}${currentLightboxImage.file_url}`}
                download={currentLightboxImage.filename}
                className="image-lightbox-download"
                onClick={(e) => e.stopPropagation()}
              >
                <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoutoutCard;