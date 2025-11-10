import { useState, useEffect } from "react";
import { api } from "../api";
import ShoutOutCard from "./ShoutOutCard";
import "../styles/AchievementsPanel.scss";

export default function AchievementsPanel({ currentUser, onCreated }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    achieved_at: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAchievements();
    if (onCreated) onCreated();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get("/shoutouts/achievements/me");
      setAchievements(response.data);
    } catch (err) {
      console.error("Error fetching achievements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.length) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else if (name === "image" && !files?.length) {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description);
      if (formData.achieved_at) payload.append("achieved_at", formData.achieved_at);
      if (formData.image) payload.append("image", formData.image);

      await api.post("/shoutouts/achievements", payload);

      setFormData({ title: "", description: "", achieved_at: "", image: null });
      setImagePreview(null);
      fetchAchievements();
    } catch (err) {
      console.error("Error creating achievement:", err);
      setError(err.response?.data?.detail || "Failed to create achievement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="achievements-panel">
      <div className="achievement-form">
        <h3>Create Achievement</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Achievement title"
          />
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your achievement..."
          />
          <label>
            Achievement Date (optional):
            <input
              type="date"
              name="achieved_at"
              value={formData.achieved_at}
              onChange={handleChange}
            />
          </label>
          <label>
            Upload Photo (optional):
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </label>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Achievement" />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: null }));
                  setImagePreview(null);
                }}
              >
                Remove
              </button>
            </div>
          )}
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Achievement"}
          </button>
        </form>
      </div>

      <div className="achievement-list">
        <h3>My Achievements</h3>
        {loading ? (
          <div className="loading">Loading achievements...</div>
        ) : achievements.length === 0 ? (
          <div className="empty-state">No achievements yet. Celebrate your wins here!</div>
        ) : (
          achievements.map((achievement) => (
            <ShoutOutCard
              key={achievement.id}
              shoutout={achievement}
              currentUser={currentUser}
              onUpdate={fetchAchievements}
            />
          ))
        )}
      </div>
    </div>
  );
}

