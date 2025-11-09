import { useState, useEffect,useRef } from "react";
import { Edit2, Trash2, TargetIcon, RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";
import EditShoutOut from "./EditShoutOut";
import ReactionBar from "./ReactionBar";
import CommentSection from "./CommentSection";
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
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [commentCounts, setCommentCounts] = useState({}); // { [shoutId]: count }

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

  const menuRefs = useRef({});

useEffect(() => {
  const handleOutsideClick = (e) => {
    if (openMenuId && menuRefs.current[openMenuId] && 
        !menuRefs.current[openMenuId].contains(e.target)) {
      setOpenMenuId(null);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);
  return () => document.removeEventListener("mousedown", handleOutsideClick);
}, [openMenuId]);

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
     <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-700 via-pink-500 to-indigo-500 text-transparent bg-clip-text">
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
          "        
        initial={{ opacity: 0, y: -10 }}
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
          className="bg-white-100 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-visible"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
       >

     {/* TOP HEADER (Matches Feed) */}
     <div className="flex justify-between items-start">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
          {shout.giver_name?.charAt(0).toUpperCase()}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">{shout.giver_name}</span>
          <span className="text-xs text-gray-500">{shout.giver_department} | {shout.giver_role}</span>

          <span className="inline-block mt-2 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
            To: {shout.receiver_name} | {shout.receiver_department} | {shout.receiver_role}
          </span>
        </div>
      </div>

      <div
          className="flex items-center gap-2 relative"
          ref={(el) => (menuRefs.current[shout.id] = el)}
      > 
      {shout.category && (
          <span className="inline-block mt-1 text-[11px] bg-indigo-50 text-indigo-700 px-2 py-[3px] rounded-md font-medium">
             🏷 {shout.category}
          </span>
      )}
        <p className="text-[11px] text-gray-400 whitespace-nowrap">
          {shout.edited_at
            ? `Edited: ${dayjs.utc(shout.edited_at).local().format("DD MMM YYYY, hh:mm A")}`
            : dayjs.utc(shout.created_at).local().format("DD MMM YYYY, hh:mm A")}
        </p>

         {/* 3 Dots Button: show always if user can take any action */}
      {(shout.giver_id === currentUser.id || currentUser.role === "admin" || currentUser.role !== "admin") && (
      <>
      <button
          onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(openMenuId === shout.id ? null : shout.id);
        }}
        className="p-1 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
      >
      ⋮
      </button>

      {openMenuId === shout.id && (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-6 bg-white border border-gray-200 
          rounded-xl shadow-lg w-36 overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]"
      >
        {/* Edit button: only creator */}
        {shout.giver_id === currentUser.id && (
          <button
            onClick={() => {
              setEditingShoutoutId(shout.id);
              setOpenMenuId(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition"
          >
            ✏️ Edit
          </button>
        )}

        {/* Delete button: creator or admin */}
        {(currentUser.role === "admin" || shout.giver_id === currentUser.id) && (
          <button
            onClick={() => {
              deleteShoutout(shout.id);
              setOpenMenuId(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition"
          >
            🗑 Delete
          </button>
        )}

        {/* Report button: only non-admin & non-creator */}
        {shout.giver_id !== currentUser.id && currentUser.role !== "admin" && (
          <button
            onClick={async () => {
              const reason = prompt("Please enter the reason for reporting this shoutout:");
              if (!reason || !reason.trim()) return;
              await ApiService.reportShoutout(shout.id, reason.trim());
              alert("Report submitted successfully!");
              setOpenMenuId(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50 transition"
          >
            🚩 Report
          </button>
        )}
      </div>
      )}
      </>
     )}
    </div>
    </div>

    {/* MESSAGE */}
    {editingShoutoutId !== shout.id && (
      <p className="text-gray-700 text-sm mt-4 leading-relaxed">
        {shout.edited_at && <span className="text-violet-600 font-medium mr-1">(Edited)</span>}
        {shout.message}
      </p>
    )}

    {/* IMAGE */}
    {shout.image_url && (
      <img
        src={shout.image_url}
        alt="attachment"
        className="w-full max-w-lg rounded-lg mt-4 shadow-sm"
      />
    )}

    {/* TAGS */}
    {shout.tagged_users?.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {shout.tagged_users.map((u) => (
          <span key={u.id} className="px-2 py-1 bg-purple-100 text-gray-700 rounded-full text-xs font-medium">
            <TargetIcon size={12} className="inline mr-1" /> {u.username}
          </span>
        ))}
      </div>
    )}

    {/* Reactions + View Comments */}
    <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-200">
      <ReactionBar shoutout={shout} />

      <button
        onClick={() =>
        setOpenCommentsId(openCommentsId === shout.id ? null : shout.id)
        }
        className="text-sm font-semibold text-violet-600 hover:underline"
      >
      {openCommentsId === shout.id
        ? `Hide Comments (${commentCounts[shout.id] ?? shout.comment_count ?? 0})`
        : `View Comments (${commentCounts[shout.id] ?? shout.comment_count ?? 0})`}
      </button>

    </div>
    {/* Show Comments BELOW card when opened */}
     {openCommentsId === shout.id && (
      <div className="mt-4">
       <CommentSection
          shoutoutId={shout.id}
          currentUser={currentUser}
          onCommentCountChange={(count) =>
          setCommentCounts((prev) => ({ ...prev, [shout.id]: count }))
        }
       />
      </div>
     )}

    {/* EDIT FORM */}
    {editingShoutoutId === shout.id && (
      <EditShoutOut
        currentUser={currentUser}
        shoutout={shout}
        onCancel={() => setEditingShoutoutId(null)}
        onUpdated={fetchShoutouts}
      />
    )}
  </motion.div>
))}

    </div>
  );
}
