import { useState, useEffect } from "react";
import { api } from "../../api";
import "../AdminDashboard/AnalyticsDashboard.scss";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");

  useEffect(() => {
    fetchAnalytics();
    fetchLeaderboard();
    fetchReports();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/admin/analytics/");
      setAnalytics(response.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get("/admin/analytics/leaderboard");
      setLeaderboard(response.data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get("/admin/analytics/reports?status=pending");
      setReports(response.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      await api.post(`/admin/analytics/reports/${reportId}/resolve?action=${action}`);
      alert(`Report ${action}ed successfully`);
      fetchReports();
    } catch (err) {
      console.error("Error resolving report:", err);
      alert("Failed to resolve report");
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get("/admin/analytics/export/csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "shoutouts_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export CSV");
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <h1>Admin Analytics Dashboard</h1>

      <div className="tabs">
        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button
          className={activeTab === "leaderboard" ? "active" : ""}
          onClick={() => setActiveTab("leaderboard")}
        >
          Leaderboard
        </button>
        <button
          className={activeTab === "reports" ? "active" : ""}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
        <button onClick={handleExportCSV} className="export-btn">
          Export CSV
        </button>
      </div>

      {activeTab === "analytics" && analytics && (
        <div className="analytics-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Shout-Outs</h3>
              <p className="stat-value">{analytics.total_shout_outs}</p>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{analytics.total_users}</p>
            </div>
            <div className="stat-card">
              <h3>Total Reactions</h3>
              <p className="stat-value">{analytics.total_reactions}</p>
            </div>
            <div className="stat-card">
              <h3>Total Comments</h3>
              <p className="stat-value">{analytics.total_comments}</p>
            </div>
          </div>

          <div className="analytics-sections">
            <div className="section">
              <h2>Top Contributors</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Shout-Outs Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.top_contributors.map((contributor) => (
                    <tr key={contributor.user_id}>
                      <td>{contributor.user_name}</td>
                      <td>{contributor.department}</td>
                      <td>{contributor.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section">
              <h2>Most Tagged</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Shout-Outs Received</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.most_tagged.map((tagged) => (
                    <tr key={tagged.user_id}>
                      <td>{tagged.user_name}</td>
                      <td>{tagged.department}</td>
                      <td>{tagged.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section">
              <h2>Department Statistics</h2>
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Shout-Outs</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.department_stats.map((stat, index) => (
                    <tr key={index}>
                      <td>{stat.department}</td>
                      <td>{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="leaderboard-content">
          <h2>Leaderboard</h2>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Department</th>
                <th>Shout-Outs Received</th>
                <th>Reactions Received</th>
                <th>Total Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.user_id}>
                  <td>{index + 1}</td>
                  <td>{entry.user_name}</td>
                  <td>{entry.department}</td>
                  <td>{entry.shout_outs_received}</td>
                  <td>{entry.reactions_received}</td>
                  <td>{entry.total_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="reports-content">
          <h2>Reported Shout-Outs</h2>
          <div className="reports-list">
            {reports.length === 0 ? (
              <p>No pending reports</p>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <h3>Report #{report.id}</h3>
                    <span className="report-status">{report.status}</span>
                  </div>
                  <p>
                    <strong>Reporter:</strong> {report.reporter?.name}
                  </p>
                  <p>
                    <strong>Reason:</strong> {report.reason || "No reason provided"}
                  </p>
                  <p>
                    <strong>Shout-Out:</strong> {report.shout_out?.content?.substring(0, 100)}...
                  </p>
                  <div className="report-actions">
                    <button
                      onClick={() => handleResolveReport(report.id, "delete")}
                      className="delete-btn"
                    >
                      Delete Shout-Out
                    </button>
                    <button
                      onClick={() => handleResolveReport(report.id, "dismiss")}
                      className="dismiss-btn"
                    >
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

