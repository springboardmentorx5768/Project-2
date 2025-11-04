import React, { useEffect, useState } from "react";
import ApiService from "../../services/api";
import CountUp from "react-countup";

const DashboardContent = ({ currentUser }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    shoutoutsSent: 0,
    shoutoutsReceived: 0,
    topContributor: "-",
  });

  const [quote, setQuote] = useState("");
  const [topAllContributors, setTopAllContributors] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchStats = async () => {
      try {
        const res = await ApiService.getDashboardStats();
        setStats({
          totalUsers: res.totalUsers || 0,
          shoutoutsSent: res.shoutoutsSent || 0,
          shoutoutsReceived: res.shoutoutsReceived || 0,
          topContributor:
            res.topDeptContributors?.length > 0
              ? res.topDeptContributors[0].username
              : "-",
        });

        setTopAllContributors(res.topAllContributors || []);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    fetchStats();

    const storedQuote = localStorage.getItem("dashboard_quote");
    if (storedQuote) {
      setQuote(storedQuote);
    } else {
      const quotes = [
        "Great teams are built on gratitude — keep spreading positivity 🌟",
        "Every shout-out makes someone’s day brighter ☀️",
        "Recognition is contagious — let’s keep the good energy going ✨",
        "Small words of appreciation create big waves of motivation 🌊",
        "Consistency in appreciation builds lasting culture 💪",
        "Your recognition fuels collaboration and trust 🔥",
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
      localStorage.setItem("dashboard_quote", randomQuote);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const statCards = [
    { title: "Department Members", value: stats.totalUsers, icon: "👥", color: "from-blue-100 to-blue-50" },
    { title: "Shout-outs Received", value: stats.shoutoutsReceived, icon: "👏", color: "from-green-100 to-green-50" },
    { title: "Shout-outs Sent", value: stats.shoutoutsSent, icon: "✉️", color: "from-yellow-100 to-yellow-50" },
    { title: "Top Contributor", value: stats.topContributor, icon: "🏆", color: "from-pink-100 to-pink-50" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50 p-8 transition-all duration-500">

      {/* Welcome Section */}
      <div className="mb-10">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 text-transparent bg-clip-text">
            Welcome back, {currentUser.username}! 
      </h2>
        <p className="text-gray-600 text-lg">
          Here’s what’s happening across your team today. Stay inspired and keep the recognition flowing!
        </p>
      </div>


       {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl shadow-md p-6 mb-10 border border-gray-100">
      <p className="text-gray-800 italic text-center text-lg font-medium">
         “{quote}”
      </p>
      </div>

      {/* Stats Info Section */}
      <p className="text-gray-600 text-base mb-6">
         Get insights into your team’s engagement — see how active your department is and track your own shout-out activity 🏆
      </p>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.color} p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:scale-[1.03] flex flex-col justify-between`}
          >
            <div className="text-4xl">{card.icon}</div>
            <p className="text-gray-700 text-sm mt-3">{card.title}</p>
            {typeof card.value === "number" ? (
              <p className="text-3xl font-bold mt-1">
                <CountUp end={card.value} duration={1.5} />
              </p>
            ) : (
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Only Top Across All Departments */}
      <div className="mt-12 w-full">
      <h3 className="text-2xl font-bold text-purple-700">
  Top Contributors Across All Departments 🏅
</h3>

        <p className="text-gray-500 text-sm mb-4">Organization-wide recognition</p>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {topAllContributors.slice(0, 5).map((user, index) => (
              <li key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl w-6 text-center">
                    {["🥇","🥈","🥉"][index] || `#${index+1}`}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.department}  {user.role}</p>
                  </div>
                </div>
                <span className="text-indigo-600 font-semibold">{user.count} Shout-Outs</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default DashboardContent;
