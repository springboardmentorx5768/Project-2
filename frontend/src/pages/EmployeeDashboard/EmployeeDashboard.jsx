import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import ShoutOutForm from "../../components/ShoutOutForm";
import ShoutOutFeed from "../../components/ShoutOutFeed";
import { api } from "../../api";
import "../EmployeeDashboard/EmployeeDashboard.scss";
import "../../styles/Navbar.scss";

export default function EmployeeDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const handleShoutOutCreated = () => {
    // Refresh the feed will be handled by ShoutOutFeed component
    window.location.reload(); // Simple refresh for now
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="loading">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Employee Dashboard</h1>
        <p>Welcome, {currentUser?.name || "User"}!</p>
        
        <div className="dashboard-content">
          <div className="shoutout-section">
            <ShoutOutForm
              onShoutOutCreated={handleShoutOutCreated}
              currentUser={currentUser}
            />
            <ShoutOutFeed currentUser={currentUser} />
          </div>
        </div>
      </div>
    </>
  );
}
