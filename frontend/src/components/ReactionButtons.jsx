import { useEffect, useState } from "react";
import { api } from "../api";
import "../styles/ReactionButtons.scss";

export default function ReactionButtons({ shoutout, currentUser, onUpdate }) {
  const [reactions, setReactions] = useState({
    like: shoutout.reaction_counts?.like ?? 0,
    clap: shoutout.reaction_counts?.clap ?? 0,
    star: shoutout.reaction_counts?.star ?? 0,
  });
  const [userReactions, setUserReactions] = useState(
    shoutout.user_reactions || []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setReactions({
      like: shoutout.reaction_counts?.like ?? 0,
      clap: shoutout.reaction_counts?.clap ?? 0,
      star: shoutout.reaction_counts?.star ?? 0,
    });
    setUserReactions(shoutout.user_reactions || []);
  }, [shoutout.id, shoutout.reaction_counts, shoutout.user_reactions]);

  const handleReaction = async (reactionType) => {
    if (loading) return;

    try {
      setLoading(true);
      const response = await api.post("/reactions/", {
        shout_out_id: shoutout.id,
        reaction_type: reactionType,
      });

      if (response.data.action === "added") {
        setUserReactions((prev) => [...prev, reactionType]);
        setReactions((prev) => ({
          ...prev,
          [reactionType]: (prev[reactionType] || 0) + 1,
        }));
      } else if (response.data.action === "removed") {
        setUserReactions((prev) => prev.filter((r) => r !== reactionType));
        setReactions((prev) => ({
          ...prev,
          [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1),
        }));
      }

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error updating reaction:", err);
      if (onUpdate) onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const isActive = (reactionType) => userReactions.includes(reactionType);

  return (
    <div className="reaction-buttons">
      <button
        className={`reaction-btn like ${isActive("like") ? "active" : ""}`}
        onClick={() => handleReaction("like")}
        disabled={loading}
        title="Like"
      >
        👍 {reactions.like || 0}
      </button>
      <button
        className={`reaction-btn clap ${isActive("clap") ? "active" : ""}`}
        onClick={() => handleReaction("clap")}
        disabled={loading}
        title="Clap"
      >
        👏 {reactions.clap || 0}
      </button>
      <button
        className={`reaction-btn star ${isActive("star") ? "active" : ""}`}
        onClick={() => handleReaction("star")}
        disabled={loading}
        title="Star"
      >
        ⭐ {reactions.star || 0}
      </button>
    </div>
  );
}
