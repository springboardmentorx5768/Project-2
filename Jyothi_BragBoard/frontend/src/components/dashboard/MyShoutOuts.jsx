import { useState, useEffect } from "react";
import dayjs from "dayjs";
import ShoutOutFeed from "./ShoutOutFeed";
import ApiService from "../../services/api";

export default function MyShoutOuts({ currentUser, handleDeleteShout }) {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [data, setData] = useState({
    total: 0,
    sent: 0,
    received: 0,
    shoutouts: [],
  });
  const [loading, setLoading] = useState(false);

  const departments = [
    "Engineering",
    "Marketing",
    "Human Resources",
    "Finance",
    "Design",
    "Sales",
    "Operations",
    "Product",
    "Support",
  ];

  // Fetch shoutouts for current user
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await ApiService.getMyShoutouts(selectedDepartment, timeFilter);
        setData(result);
      } catch (err) {
        console.error("Failed to fetch my shoutouts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDepartment, timeFilter]);

  // ------------------ Filter shoutouts ------------------
  const filteredByDepartment = data.shoutouts.filter((s) => {
    if (selectedDepartment === "all") return true;
    return (
      s.receiver_department === selectedDepartment ||
      s.tagged_users?.some((u) => u.department === selectedDepartment)
    );
  });

  const filtered = filteredByDepartment.filter((s) => {
    if (timeFilter === "all") return true;
    const cutoff = dayjs().subtract(parseInt(timeFilter), "day");
    return dayjs(s.created_at).isAfter(cutoff);
  });

  // ------------------ Compute stats ------------------
  const total = filtered.length;
  const sent = filtered.filter((s) => s.giver_name === currentUser?.username).length;
  const received = filtered.filter(
    (s) =>
      s.receiver_name === currentUser?.username ||
      s.tagged_users?.some((u) => u.username === currentUser?.username)
  ).length;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
        My Shout-Outs
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-600 mr-2 font-semibold">
            Department:
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 shadow-sm"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mr-2 font-semibold">
            Time:
          </label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 shadow-sm"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow flex-1 text-center border border-gray-100">
          <p className="text-gray-500">Total Shout-Outs</p>
          <p className="text-2xl font-bold text-indigo-600">{total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow flex-1 text-center border border-gray-100">
          <p className="text-gray-500">Sent</p>
          <p className="text-2xl font-bold text-green-600">{sent}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow flex-1 text-center border border-gray-100">
          <p className="text-gray-500">Received</p>
          <p className="text-2xl font-bold text-pink-600">{received}</p>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : filtered.length > 0 ? (
        <ShoutOutFeed
          currentUser={currentUser}
          shoutouts={filtered}
          handleDeleteShout={handleDeleteShout}
        />
      ) : (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500 border border-gray-100">
          You haven’t sent or received any shout-outs
          {selectedDepartment !== "all"
            ? ` in the ${selectedDepartment} department`
            : ""}
          {timeFilter !== "all"
            ? ` within the last ${timeFilter} days.`
            : "."}
        </div>
      )}
    </div>
  );
}
