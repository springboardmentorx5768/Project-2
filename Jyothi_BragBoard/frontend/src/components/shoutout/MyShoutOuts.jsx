import { useState, useEffect } from "react";
import { Edit2, Trash2, TargetIcon, RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";
import EditShoutOut from "./EditShoutOut";
import ReactionBar from "./ReactionBar";
import ApiService from "../../services/api";

dayjs.extend(utc);

export default function MyShoutOuts({ currentUser }) {
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiverDept, setReceiverDept] = useState("All Departments");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchName, setSearchName] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingShoutoutId, setEditingShoutoutId] = useState(null);
  const [stats, setStats] = useState({ total: 0, sent: 0, received: 0 });

  const departments = [
    "All Departments",
    "Engineering",
    "Human Resources",
    "Sales",
    "Marketing",
    "Finance",
    "Operations",
    "Design",
  ];

  // Fetch shoutouts
  const fetchShoutouts = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getMyShoutouts({
        receiver_department: receiverDept === "All Departments" ? "all" : receiverDept,
        days: timeFilter === "all" ? undefined : parseInt(timeFilter),
      });

      let data = res.shoutouts || [];
      data = data.filter(s => s.message !== "This shoutout was deleted");

      // Search by receiver name
      if (searchName.trim()) {
        data = data.filter(s =>
          s.receiver_name.toLowerCase().includes(searchName.toLowerCase())
        );
      }

      // Sort by edited_at / created_at descending
      const sorted = data.sort((a, b) => {
        const aTime = new Date(a.edited_at || a.created_at);
        const bTime = new Date(b.edited_at || b.created_at);
        return bTime - aTime;
      });

      setShoutouts(sorted);

      // Update stats
      setStats({ total: res.total, sent: res.sent, received: res.received });
    } catch (err) {
      console.error("Failed to fetch my shoutouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoutouts();
  }, [receiverDept, timeFilter, searchName]);

  const clearFilters = () => {
    setReceiverDept("All Departments");
    setTimeFilter("all");
    setSearchName("");
  };

  const deleteShoutout = async (shoutId) => {
    if (!confirm("Are you sure you want to delete this shoutout?")) return;
    try {
      await ApiService.deleteShoutout(shoutId);

      // Remove deleted shoutout from the list
      setShoutouts(prev => prev.filter(s => s.id !== shoutId));

    } catch (err) {
      console.error("Delete shoutout failed:", err);
    }
  };

  return (
    <div className="p-4 flex flex-col space-y-6">
     <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 text-transparent bg-clip-text">
       My Shout-Outs
      </h2>
      <p className="text-gray-500 mb-6">
           Track the shout-outs you’ve sent and received, and stay engaged with your team 💬
      </p>

      {/* Filters */}
      <motion.div
className="
bg-white/70 backdrop-blur-md border border-gray-200
rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4
"        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Receiver Department:</label>
          <select
            value={receiverDept}
            onChange={(e) => setReceiverDept(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none transition-all hover:border-green-400"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Time:</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none transition-all hover:border-purple-400"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search by receiver name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="flex-1 min-w-[250px] border rounded-xl px-4 py-2 text-sm focus:outline-none shadow-sm hover:shadow-md transition-all"
        />

        <motion.button
          onClick={clearFilters}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center text-sm bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold px-4 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <RotateCcw size={18} className="mr-2" /> Clear Filters
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-6">
      <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-gradient-to-br from-white to-indigo-50 p-5 rounded-xl shadow-md flex-1 text-center border border-gray-100 hover:shadow-xl cursor-pointer transition-all"
      >
      <p className="text-gray-500">Total Shout-Outs</p>
      <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
      </motion.div>
      <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-gradient-to-br from-white to-green-50 p-5 rounded-xl shadow-md flex-1 text-center border border-gray-100 hover:shadow-xl cursor-pointer transition-all"
      >
      <p className="text-gray-500">Sent</p>
      <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-gradient-to-br from-white to-pink-50 p-5 rounded-xl shadow-md flex-1 text-center border border-gray-100 hover:shadow-xl cursor-pointer transition-all"
      >
      <p className="text-gray-500">Received</p>
      <p className="text-2xl font-bold text-pink-600">{stats.received}</p>
     </motion.div>
     </div>



      {/* Shoutouts */}
      {loading && <div className="text-center mt-6 text-gray-500">Loading...</div>}
      {!loading && shoutouts.length === 0 && (
        <div className="text-center mt-2 text-pink-600 font-semibold text-lg bg-pink-50 py-4 rounded-xl mx-6 shadow-inner">
          No shoutouts found for the selected filters.
        </div>
      )}

      {shoutouts.map((shout) => (
        <motion.div
          key={shout.id}
          className=" 
          relative overflow-visible z-20
          bg-white/80 backdrop-blur-lg border border-gray-200
          rounded-3xl p-6 shadow-sm hover:shadow-md transition-all
          "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
      <div className="flex justify-between items-start mb-3 relative">
        <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {shout.giver_name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
        <p className="font-semibold text-gray-800">{shout.giver_name}</p>
        <p className="text-gray-500 text-xs">
          {`${shout.giver_department || "N/A"} | ${shout.giver_role || "N/A"}`}
        </p>
       </div>
      </div>

    <div className="flex flex-col items-end relative">
    {/* Always show created/edited times */}
    <div className="text-gray-500 text-xs flex flex-col items-end">
      <span>
        Created: {dayjs.utc(shout.created_at).local().format("DD MMM YYYY, hh:mm A")}
      </span>
      {shout.edited_at && (
        <span className="text-violet-600 italic">
           Edited: {dayjs.utc(shout.edited_at).local().format("DD MMM YYYY, hh:mm A")}
        </span>
      )}
    </div>

    {(shout.giver_id === currentUser.id || currentUser.role === "admin") && (
  <div className="relative mt-1">
    <button
      onClick={() => setOpenMenuId(openMenuId === shout.id ? null : shout.id)}
      className="text-gray-500 hover:text-gray-800 text-xl font-bold focus:outline-none"
    >
      ⋮
    </button>

    {openMenuId === shout.id && (
      <div className="absolute right-0 mt-2 w-28 bg-white border rounded-xl shadow-lg flex flex-col z-20">

        {shout.giver_id === currentUser.id && (
          <button
            onClick={() => {
              setEditingShoutoutId(shout.id);
              setOpenMenuId(null);
            }}
            className="px-4 py-2 text-left text-sm hover:bg-blue-100 rounded-t-xl flex items-center gap-2"
          >
            <Edit2 size={14} /> Edit
          </button>
        )}

        {/*   Delete for giver OR admin */}
        <button
          onClick={() => {
            deleteShoutout(shout.id);
            setOpenMenuId(null);
          }}
          className={`px-4 py-2 text-left text-sm hover:bg-red-100 flex items-center gap-2 ${
            shout.giver_id !== currentUser.id ? "rounded-xl" : "rounded-b-xl"
          }`}
        >
          <Trash2 size={14} /> Delete
        </button>

      </div>
    )}
  </div>
)}

      </div>
      </div> 
          {/* Receiver */}
          <div className="flex items-center mb-2">
          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">
          🎯 To: {shout.receiver_name} | {shout.receiver_department || "N/A"} | {shout.receiver_role || "N/A"}
            </span>
          </div>

          {/* Edit Form or Message */}
          {editingShoutoutId === shout.id ? (
            <EditShoutOut
              currentUser={currentUser}
              shoutout={shout}
              onCancel={() => setEditingShoutoutId(null)}
              onUpdated={fetchShoutouts}
            />
          ) : (
            <>
              <p className="text-gray-700 my-2">
                {shout.edited_at && (
                  <span className="font-semibold text-sm mr-1 text-violet-600">Edited: </span>
                )}
                {shout.message}
              </p>

              {shout.image_url && (
                <div className="w-full mt-2 mb-2">
                  <img
                    src={shout.image_url}
                    alt="shoutout"
                    className="w-full max-w-lg h-auto object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              {shout.tagged_users?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {shout.tagged_users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100"
                    >
                      <TargetIcon size={12} className="mr-1 text-gray-700" />
                      {u.username}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {/* Reactions */}
<div className="mt-4">
<ReactionBar shoutout={shout} />
</div>

        </motion.div>
      ))}
    </div>
  );
}
