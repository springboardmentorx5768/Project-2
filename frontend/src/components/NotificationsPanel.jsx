import { useState, useEffect } from "react";
import { api } from "../api";
import "../styles/NotificationsPanel.scss";

const ICONS = {
  reaction: "🔔",
  comment: "💬",
  follow: "📣",
};

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/notifications/mark-all-read");
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notifications read:", err);
    }
  };

  if (loading) {
    return <div className="notifications-panel loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-panel">
      <div className="panel-header">
        <h3>Notifications</h3>
        {notifications.length > 0 && (
          <button onClick={markAllRead}>Mark all as read</button>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      {notifications.length === 0 ? (
        <div className="empty-state">You're all caught up! 🎉</div>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notification) => (
            <li key={notification.id} className={notification.is_read ? "read" : "unread"}>
              <span className="icon">
                {ICONS[notification.notification_type] || "🔔"}
              </span>
              <div className="message">
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.created_at).toLocaleString()}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

