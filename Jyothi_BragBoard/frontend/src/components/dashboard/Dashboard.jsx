import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import ApiService from "../../services/api"; 

const Dashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState("dashboard");
  const [shoutouts, setShoutouts] = useState([]);
  const [shoutoutUpdated, setShoutoutUpdated] = useState(false);

  // Fetch shoutouts on mount
  useEffect(() => {
    const fetchShoutouts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://localhost:8000/shoutouts/feed?department=all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch shoutouts");
        const data = await res.json();
        setShoutouts(data);
      } catch (error) {
        console.error("Error loading shoutouts:", error);
      }
    };

    fetchShoutouts();
  }, []);

  const handleShoutoutPosted = () => {
    setShoutoutUpdated((prev) => !prev); // toggles to notify feed
  };
  
  // Handle delete locally
  const handleDeleteShout = (id) => {
    setShoutouts((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <Header user={user} onLogout={onLogout} />

      {/* Sidebar + MainContent */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          userRole={user?.role}
        />

        <div className="flex-1 overflow-y-auto">
          <MainContent
            activeView={activeView}
            user={user}
            shoutouts={shoutouts}
            handleDeleteShout={handleDeleteShout}
            shoutoutUpdated={shoutoutUpdated}      
            handleShoutoutPosted={handleShoutoutPosted}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
