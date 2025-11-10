import { useState, useEffect } from "react";
import { api } from "../api";
import "../styles/ShoutOutForm.scss";

export default function ShoutOutForm({ onShoutOutCreated, currentUser }) {
  const [content, setContent] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.get("/auth/department-employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    if (!recipientId) {
      setError("Please select a recipient");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("content", content);
      formData.append("recipient_id", parseInt(recipientId, 10));
      if (title.trim()) {
        formData.append("title", title.trim());
      }
      formData.append("category", "shoutout");
      if (image) {
        formData.append("image", image);
      }

      const response = await api.post("/shoutouts/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setContent("");
      setTitle("");
      setRecipientId("");
      setImage(null);
      setImagePreview(null);
      setError("");

      alert("Shout-out created successfully!");
      
      // Call callback after alert to ensure UI updates
      if (onShoutOutCreated) {
        onShoutOutCreated(response.data);
      }
    } catch (err) {
      console.error("Error creating shout-out:", err);
      setError(err.response?.data?.detail || "Failed to create shout-out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shoutout-form">
      <h2>Create Shout-Out</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title (optional):</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Kudos for an amazing job"
          />
        </div>

        <div className="form-group">
          <label htmlFor="recipient">Tag Employee:</label>
          <select
            id="recipient"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            required
          >
            <option value="">Select an employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">Message:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your shout-out message..."
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Image (optional):</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Shout-Out"}
        </button>
      </form>
    </div>
  );
}

