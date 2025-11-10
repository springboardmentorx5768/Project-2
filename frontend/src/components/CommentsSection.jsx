import { useState, useEffect } from "react";
import { api } from "../api";
import CommentItem from "./CommentItem";
import "../styles/CommentsSection.scss";

export default function CommentsSection({ shoutoutId, currentUser, onUpdate }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [shoutoutId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await api.get(`/comments/shoutout/${shoutoutId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");
      await api.post(
        "/comments/",
        {
          content: newComment,
          shout_out_id: shoutoutId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewComment("");
      fetchComments();
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      alert("Failed to create comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDelete = () => {
    fetchComments();
    if (onUpdate) {
      onUpdate();
    }
  };

  if (loading) {
    return <div className="loading">Loading comments...</div>;
  }

  return (
    <div className="comments-section">
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={2}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">No comments yet</div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              shoutoutId={shoutoutId}
              onDelete={handleCommentDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

