import { useState } from "react";
import { api } from "../api";
import "../styles/CommentItem.scss";

export default function CommentItem({ comment, currentUser, shoutoutId, onDelete }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");
      await api.post(
        "/comments/",
        {
          content: replyText,
          shout_out_id: shoutoutId,
          parent_id: comment.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReplyText("");
      setShowReply(false);
      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      console.error("Error creating reply:", err);
      alert("Failed to create reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/comments/${comment.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment");
    }
  };

  const canDelete = currentUser?.id === comment.user_id || 
                    currentUser?.role === "admin" || 
                    currentUser?.role === "superadmin";

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-avatar">
          {comment.user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="comment-info">
          <div className="comment-author">{comment.user?.name || "Unknown"}</div>
          <div className="comment-date">{formatDate(comment.created_at)}</div>
        </div>
        {canDelete && (
          <button className="delete-comment-btn" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
      <div className="comment-content">{comment.content}</div>
      <div className="comment-actions">
        <button onClick={() => setShowReply(!showReply)}>
          {showReply ? "Cancel" : "Reply"}
        </button>
      </div>
      {showReply && (
        <form onSubmit={handleReply} className="reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post Reply"}
          </button>
        </form>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              shoutoutId={shoutoutId}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

