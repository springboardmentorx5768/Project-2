import { useEffect, useState } from "react";
import { api } from "../api";
import "../styles/ProfileSettings.scss";

const initialState = {
  username: "",
  email: "",
  department: "",
  bio: "",
  joining_date: "",
  current_project: "",
  group_members: "",
  current_password: "",
  new_password: "",
};

export default function ProfileSettings() {
  const [profile, setProfile] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      const data = response.data;
      setProfile((prev) => ({
        ...prev,
        username: data.username || "",
        email: data.email || "",
        department: data.department || "",
        bio: data.bio || "",
        joining_date: data.joining_date || "",
        current_project: data.current_project || "",
        group_members: data.group_members || "",
        current_password: "",
        new_password: "",
      }));
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile information.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);
      await api.put("/auth/update-profile", {
        username: profile.username || undefined,
        email: profile.email || undefined,
        department: profile.department || undefined,
        bio: profile.bio || undefined,
        joining_date: profile.joining_date || undefined,
        current_project: profile.current_project || undefined,
        group_members: profile.group_members || undefined,
        current_password: profile.current_password || undefined,
        new_password: profile.new_password || undefined,
      });
      setSuccess("Profile updated successfully.");
      setProfile((prev) => ({ ...prev, current_password: "", new_password: "" }));
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-settings loading">Loading profile...</div>;
  }

  return (
    <div className="profile-settings">
      <h3>Profile Settings</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Department / Team</label>
          <input
            type="text"
            name="department"
            value={profile.department}
            onChange={handleChange}
            placeholder="e.g., Engineering, Marketing"
          />
        </div>

        <div className="form-row">
          <label>Bio</label>
          <textarea
            name="bio"
            rows={3}
            value={profile.bio}
            onChange={handleChange}
            placeholder="Tell your teammates about yourself..."
          />
        </div>

        <div className="form-row grid">
          <div>
            <label>Joining Date</label>
            <input
              type="date"
              name="joining_date"
              value={profile.joining_date || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Current Project</label>
            <input
              type="text"
              name="current_project"
              value={profile.current_project}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <label>Group Members (comma separated)</label>
          <input
            type="text"
            name="group_members"
            value={profile.group_members}
            onChange={handleChange}
            placeholder="e.g., Alice, Bob"
          />
        </div>

        <div className="form-row grid">
          <div>
            <label>Current Password</label>
            <input
              type="password"
              name="current_password"
              value={profile.current_password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>New Password</label>
            <input
              type="password"
              name="new_password"
              value={profile.new_password}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

