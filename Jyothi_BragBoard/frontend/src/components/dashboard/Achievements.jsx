import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ApiService from "../../services/api";
import { toast } from "react-hot-toast";

// Define icons for each achievement type
const STAT_ICONS = {
  "Consistency Streak": "🔥",
  "Shoutouts Sent": "✉️",
  "Shoutouts Received": "📩",
  "Reactions Given": "❤️",
  "Reactions Received": "💌",
  "Comments Given": "💬",
  "Comments Received": "📝",
  "Tagged in Shoutouts": "🏷️",
  "Monthly Contributor": "🏆",
};

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await ApiService.getAchievements();
        const sorted = res.achievements.sort((a, b) =>
          a.title.includes("Consistency") ? -1 : 1
        );
        setAchievements(sorted || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const progress = (count, milestone) =>
    Math.min((count / milestone) * 100, 100).toFixed(0);

  const nextMilestone = (count, milestone) =>
    count >= milestone ? milestone * 2 : milestone;

  const earnedBadges = (count, milestone) => {
    const badges = [];
    if (count >= milestone) badges.push("Bronze 🥉");
    if (count >= milestone * 2) badges.push("Silver 🥈");
    if (count >= milestone * 4) badges.push("Gold 🥇");
    return badges;
  };

  // subtle heading colors
  const headingColors = [
    "text-indigo-600",
    "text-pink-600",
    "text-green-600",
    "text-purple-600",
    "text-yellow-600",
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-500 text-transparent bg-clip-text">
          Achievements & Progress
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
          Track your contributions, engagement, and consistency. Each card shows
          your progress, milestones, and earned badges.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500 mt-4">Loading achievements...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a, i) => {
            const currentMilestone = nextMilestone(a.count, a.milestone);
            const headingColor = headingColors[i % headingColors.length];
            const icon = STAT_ICONS[a.title] || "⭐";

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.015 }}
                className="bg-white-50 rounded-xl shadow-sm border border-indigo-200 p-4 flex flex-col justify-between transition"
              >
                {/* Icon */}
                <div className="text-3xl text-center mb-2">{icon}</div>

                {/* Title */}
                <h2
                  className={`text-center font-semibold text-lg mb-2 ${headingColor}`}
                >
                  {a.title}
                </h2>
                
                {/* Earned Badges */}
                {earnedBadges(a.count, a.milestone).length > 0 && (
                  <div className="flex justify-center gap-1 mb-2 flex-wrap">
                    {earnedBadges(a.count, a.milestone).map((b, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-gray-700 px-2 py-0.5 rounded-full border border-gray-300"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Progress Bar */}
                <div className="w-full bg-indigo-200 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-indigo-400 transition-all"
                    style={{ width: `${progress(a.count, currentMilestone)}%` }}
                  />
                </div>

                {/* Next milestone / max */}
                <p className="text-center text-gray-600 text-xs">
                  {a.count >= a.milestone ? (
                    <>
                      Max milestone reached! Next target:{" "}
                      <span className="font-semibold">{currentMilestone}</span>
                    </>
                  ) : (
                    <>
                      Only{" "}
                      <span className="font-semibold">
                        {currentMilestone - a.count}
                      </span>{" "}
                      more to reach next level ✨
                    </>
                  )}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
