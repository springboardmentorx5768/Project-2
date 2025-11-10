import { useState, useEffect } from "react";
import { api } from "../api";
import { DEPARTMENTS } from "../constants/departments";
import ShoutOutCard from "./ShoutOutCard";
import "../styles/ShoutOutFeed.scss";

export default function ShoutOutFeed({ currentUser, category = "shoutout", refreshKey = 0 }) {
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: "",
    sender_id: "",
    recipient_id: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchShoutouts();
  }, [filters, category, refreshKey]);

  const fetchShoutouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      params.append("category", category);

      const endpoint = `/shoutouts/?${params.toString()}`;

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShoutouts(response.data);
    } catch (err) {
      console.error("Error fetching shout-outs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleShoutOutUpdate = () => {
    fetchShoutouts();
  };

  if (loading) {
    return <div className="loading">Loading shout-outs...</div>;
  }

  return (
    <div className="shoutout-feed">
      <div className="filters">
        <h3>Filters</h3>
        <div className="filter-group">
          <label>Department:</label>
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange("start_date", e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange("end_date", e.target.value)}
          />
        </div>
        <button
          onClick={() =>
            setFilters({
              department: "",
              sender_id: "",
              recipient_id: "",
              start_date: "",
              end_date: "",
            })
          }
        >
          Clear Filters
        </button>
      </div>

      <div className="shoutouts-list">
        {shoutouts.length === 0 ? (
          <div className="no-shoutouts">No shout-outs found</div>
        ) : (
          shoutouts.map((shoutout) => (
            <ShoutOutCard
              key={shoutout.id}
              shoutout={shoutout}
              currentUser={currentUser}
              onUpdate={handleShoutOutUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}

