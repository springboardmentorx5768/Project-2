import { useState } from "react";
import { api } from "../api";
import ReactionButtons from "./ReactionButtons";
import CommentsSection from "./CommentsSection";
import "../styles/ShoutOutCard.scss";

const CATEGORY_LABELS = {
  shoutout: "Shout-Out",
  timeline: "Timeline",
  achievement: "Achievement",
  team: "Team Board",
};

export default function ShoutOutCard({ shoutout, currentUser, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/shoutouts/${shoutout.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onUpdate) {
        onUpdate();
      }
      alert("Post deleted successfully");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post");
    }
  };

  const handleReport = async () => {
    const reason = window.prompt("Please provide a reason for reporting:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("accessToken");
      await api.post(
        `/shoutouts/${shoutout.id}/report`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Post reported successfully");
    } catch (err) {
      console.error("Error reporting post:", err);
      alert("Failed to report post");
    }
  };

  const canDelete =
    currentUser?.id === shoutout.sender_id ||
    currentUser?.role === "admin" ||
    currentUser?.role === "superadmin";

  const categoryLabel = CATEGORY_LABELS[shoutout.category] || "Post";
  const eventDateLabel = formatDate(shoutout.event_date);

  return (
    <div className={`shoutout-card card-${shoutout.category || "shoutout"}`}>
      <div className="shoutout-header">
        <div className="user-info">
          <div className="avatar">
            {shoutout.sender?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <div className="sender-name">{shoutout.sender?.name || "Unknown"}</div>
            {shoutout.created_at && (
              <div className="timestamp">{formatDate(shoutout.created_at)}</div>
            )}
            {eventDateLabel && (
              <div className="event-date">Event Date: {eventDateLabel}</div>
            )}
          </div>
        </div>
        <div className="actions">
          <span className={`category-pill category-${shoutout.category}`}>
            {categoryLabel}
          </span>
          {canDelete && (
            <button className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
          )}
          <button className="report-btn" onClick={handleReport}>
            Report
          </button>
        </div>
      </div>

      <div className="shoutout-content">
        {shoutout.title && <h3 className="shoutout-title">{shoutout.title}</h3>}
        <p>{shoutout.content}</p>
        {shoutout.image_url && (
          <div className="shoutout-image">
            <img
              src={
                shoutout.image_url.startsWith("http")
                  ? shoutout.image_url
                  : `${API_URL}${shoutout.image_url}`
              }
              alt="Shout-out"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {(shoutout.recipient || shoutout.category === "team") && (
        <div className="shoutout-footer">
          {shoutout.recipient ? (
            <div className="recipient-info">
              <span className="tag-label">Shout-out to:</span>
              <span className="recipient-name">
                {shoutout.recipient?.name || "Unknown"}
              </span>
            </div>
          ) : (
            <div className="recipient-info">
              <span className="tag-label">Team:</span>
              <span className="recipient-name">{shoutout.department || "Team"}</span>
            </div>
          )}
          <div className="department-badge">
            {shoutout.department || "All Departments"}
          </div>
        </div>
      )}

      <ReactionButtons shoutout={shoutout} currentUser={currentUser} onUpdate={onUpdate} />

      <div className="comments-toggle">
        <button onClick={() => setShowComments(!showComments)}>
          {showComments ? "Hide" : "Show"} Comments ({shoutout.comment_count || 0})
        </button>
      </div>

      {showComments && (
        <CommentsSection
          shoutoutId={shoutout.id}
          currentUser={currentUser}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

