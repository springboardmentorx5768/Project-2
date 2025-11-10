import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { api } from "../../api";
import "../AdminDashboard/AdminDashboard.scss";

export default function AdminDashboard({ accessToken: propToken }) {
  const [securityKeys, setSecurityKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("analytics");

  // Use token from prop or localStorage
  const accessToken = propToken || localStorage.getItem("accessToken");

  // Fetch all security keys
  const fetchKeys = async () => {
    if (!accessToken) {
      setError("Access token missing. Please login as admin.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/security-keys");
      setSecurityKeys(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch security keys");
    } finally {
      setLoading(false);
    }
  };

  // Generate a new security key
  const generateKey = async () => {
    if (!accessToken) return alert("Access token missing. Please login.");
    try {
      const response = await api.post("/auth/security-keys");
      alert(`New Security Key: ${response.data.security_key}`);
      fetchKeys(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to generate security key");
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin!</p>

        <div className="admin-tabs">
          <button
            className={activeTab === "analytics" ? "active" : ""}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
          <button
            className={activeTab === "security" ? "active" : ""}
            onClick={() => setActiveTab("security")}
          >
            Security Keys
          </button>
        </div>

        {activeTab === "analytics" && <AnalyticsDashboard />}

        {activeTab === "security" && (
          <div className="security-key-section">
            {loading && <p>Loading security keys...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && (
              <>
                <h2>Security Keys</h2>
                <button onClick={generateKey}>Generate New Key</button>

                {securityKeys.length === 0 ? (
                  <p>No security keys available.</p>
                ) : (
                  <ul>
                    {securityKeys.map((k) => (
                      <li key={k.id}>
                        {k.key} -
                        <span
                          className={`status ${k.is_used ? "used" : "available"}`}
                        >
                          {k.is_used ? "Used" : "Available"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
