import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../api";
import ShoutOutForm from "../components/ShoutOutForm";
import ShoutOutFeed from "../components/ShoutOutFeed";
import TimelineComposer from "../components/TimelineComposer";
import TimelineFeed from "../components/TimelineFeed";
import AchievementsPanel from "../components/AchievementsPanel";
import NotificationsPanel from "../components/NotificationsPanel";
import TeamBoard from "../components/TeamBoard";
import ProfileSettings from "../components/ProfileSettings";
import "../styles/Home.scss";
import "../styles/DashboardCards.scss";
import ShoutOutCard from "../components/ShoutOutCard";

const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "shout", label: "Shout to Employee" },
  { key: "timeline", label: "Write on Timeline" },
  { key: "myAchievements", label: "My Achievements" },
  { key: "notifications", label: "Notifications" },
  { key: "teamBoard", label: "Team Board" },
  { key: "profile", label: "Profile Settings" },
];

export default function Home() {
  const [active, setActive] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [shoutoutRefresh, setShoutoutRefresh] = useState(0);
  const [timelineRefresh, setTimelineRefresh] = useState(0);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user information. Please log in again.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const fetchSummary = async () => {
    if (!currentUser) return;
    try {
      setSummaryLoading(true);
      // Add timestamp to prevent caching
      const response = await api.get(`/shoutouts/summary?_t=${Date.now()}`);
      console.log("Summary data received:", response.data);
      if (response.data) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSummary();
    }
  }, [currentUser, shoutoutRefresh, timelineRefresh]);

  // Refresh summary when dashboard tab is activated
  useEffect(() => {
    if (active === "dashboard" && currentUser) {
      fetchSummary();
    }
  }, [active, currentUser]);

  const handleShoutOutCreated = () => {
    setShoutoutRefresh((prev) => prev + 1);
    // Refresh summary after a short delay to ensure DB commit completes
    if (currentUser) {
      setTimeout(() => {
        fetchSummary();
      }, 500);
    }
  };

  const handleTimelinePost = () => {
    setTimelineRefresh((prev) => prev + 1);
    // Refresh summary in case timeline posts affect counts (they don't, but keep consistent)
    if (currentUser) {
      fetchSummary();
    }
  };

  if (loadingUser) {
    return (
      <>
        <Navbar />
        <div className="home-loading">Loading your workspace...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="home-error">{error}</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="home-container">
        <aside className="sidebar">
          <ul>
            {MENU_ITEMS.map((item) => (
              <li
                key={item.key}
                className={active === item.key ? "active" : ""}
                onClick={() => setActive(item.key)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        <main className="content">
          {active === "dashboard" && (
            <div className="panel-stack">
              <h2>Department Shout-Outs</h2>
              <div className="dashboard-cards">
                <div className="card achievements">
                  <div className="card-title">Achievements</div>
                  <div className="card-value">
                    {summaryLoading ? "-" : summary?.achievements_count ?? 0}
                  </div>
                </div>
                <div className="card shoutouts-sent">
                  <div className="card-title">Shout-Outs Posted</div>
                  <div className="card-value">
                    {summaryLoading ? "-" : summary?.shoutouts_sent_count ?? 0}
                  </div>
                </div>
                <div className="card shoutouts-received">
                  <div className="card-title">Shout-Outs Received</div>
                  <div className="card-value">
                    {summaryLoading ? "-" : summary?.shoutouts_received_count ?? 0}
                  </div>
                </div>
              </div>
              {summary?.recent_shoutouts?.length > 0 && (
                <div className="recent-shoutouts">
                  <h3>Your Recent Shout-Outs</h3>
                  {summary.recent_shoutouts.map((item) => (
                    <ShoutOutCard
                      key={`recent-${item.id}`}
                      shoutout={item}
                      currentUser={currentUser}
                      onUpdate={fetchSummary}
                    />
                  ))}
                </div>
              )}
              <ShoutOutFeed
                currentUser={currentUser}
                category="shoutout"
                refreshKey={shoutoutRefresh}
              />
            </div>
          )}

          {active === "shout" && (
            <div className="panel-stack">
              <h2>Send a Shout-Out</h2>
              <ShoutOutForm
                onShoutOutCreated={handleShoutOutCreated}
                currentUser={currentUser}
              />
              <ShoutOutFeed
                currentUser={currentUser}
                category="shoutout"
                refreshKey={shoutoutRefresh}
              />
            </div>
          )}

          {active === "timeline" && (
            <div className="panel-stack">
              <h2>Timeline</h2>
              <TimelineComposer onPostCreated={handleTimelinePost} />
              <TimelineFeed
                currentUser={currentUser}
                refreshKey={timelineRefresh}
              />
            </div>
          )}

          {active === "myAchievements" && (
            <AchievementsPanel currentUser={currentUser} onCreated={fetchSummary} />
          )}

          {active === "notifications" && <NotificationsPanel />}

          {active === "teamBoard" && <TeamBoard currentUser={currentUser} />}

          {active === "profile" && <ProfileSettings />}
        </main>
      </div>
    </>
  );
}
