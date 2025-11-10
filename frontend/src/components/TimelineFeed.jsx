import { useState, useEffect } from "react";
import { api } from "../api";
import ShoutOutCard from "./ShoutOutCard";
import "../styles/TimelineFeed.scss";

export default function TimelineFeed({ currentUser, refreshKey = 0 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [refreshKey]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await api.get("/shoutouts/timeline");
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching timeline posts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading timeline...</div>;
  }

  return (
    <div className="timeline-feed">
      {posts.length === 0 ? (
        <div className="empty-state">No timeline posts yet. Be the first to share!</div>
      ) : (
        posts.map((post) => (
          <ShoutOutCard
            key={post.id}
            shoutout={post}
            currentUser={currentUser}
            onUpdate={fetchTimeline}
          />
        ))
      )}
    </div>
  );
}

