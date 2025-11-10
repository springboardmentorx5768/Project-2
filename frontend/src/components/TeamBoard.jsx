import { useState, useEffect } from "react";
import { api } from "../api";
import ShoutOutCard from "./ShoutOutCard";
import "../styles/TeamBoard.scss";

export default function TeamBoard({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeamPosts();
  }, []);

  const fetchTeamPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/shoutouts/team");
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching team posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.content.trim()) {
      setError("Please add content for your update.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/shoutouts/team", {
        title: formData.title.trim() || undefined,
        content: formData.content,
      });
      setFormData({ title: "", content: "" });
      fetchTeamPosts();
    } catch (err) {
      console.error("Error creating team post:", err);
      setError(err.response?.data?.detail || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="team-board">
      <div className="team-form">
        <h3>Share with your Team</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title (optional)"
          />
          <textarea
            name="content"
            rows={4}
            value={formData.content}
            onChange={handleChange}
            placeholder={`Share an update with your ${currentUser?.department || "team"}...`}
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post to Team"}
          </button>
        </form>
      </div>

      <div className="team-feed">
        <h3>Team Feed</h3>
        {loading ? (
          <div className="loading">Loading team posts...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            No team posts yet. Start the conversation with your team!
          </div>
        ) : (
          posts.map((post) => (
            <ShoutOutCard
              key={post.id}
              shoutout={post}
              currentUser={currentUser}
              onUpdate={fetchTeamPosts}
            />
          ))
        )}
      </div>
    </div>
  );
}

