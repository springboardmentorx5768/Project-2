import { useState } from "react";
import { api } from "../api";
import "../styles/TimelineComposer.scss";

export default function TimelineComposer({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Please write something for your post.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/shoutouts/timeline", {
        title: title.trim() || undefined,
        content,
      });

      setTitle("");
      setContent("");
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error("Error creating timeline post:", err);
      setError(err.response?.data?.detail || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="timeline-composer">
      <h3>Write on Timeline</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Share your update, win, or shout-out..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}

