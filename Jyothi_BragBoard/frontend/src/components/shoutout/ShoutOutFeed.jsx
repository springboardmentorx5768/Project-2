import { useState, useEffect } from "react";
import { Edit2, Trash2, Filter, RotateCcw, TargetIcon } from "lucide-react";
import ApiService from "../../services/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";
import EditShoutOut from "./EditShoutOut";

dayjs.extend(utc);

export default function ShoutOutFeed({ currentUser, shoutoutUpdated }) {
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);
  const [editingShoutoutId, setEditingShoutoutId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [senderDept, setSenderDept] = useState("All Departments");
  const [receiverDept, setReceiverDept] = useState("All Departments");
  const [searchName, setSearchName] = useState("");
  const [date, setDate] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

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
      const res = await ApiService.getShoutouts();
      const visible = res.filter(
        (s) =>
          (s.is_public || s.giver_id === currentUser.id || s.receiver_id === currentUser.id) &&
          s.message !== "This shoutout was deleted"
      );

      const sorted = visible.sort((a, b) => {
        const aTime = new Date(a.edited_at || a.created_at);
        const bTime = new Date(b.edited_at || b.created_at);
        return bTime - aTime;
      });

      setShoutouts(sorted);
    } catch (err) {
      console.error("Failed to fetch shoutouts", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const res = await ApiService.getUsers();
      setAllUsers(res);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchShoutouts();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (shoutoutUpdated) fetchShoutouts();
  }, [shoutoutUpdated]);

  // Filtering
  useEffect(() => {
    let result = [...shoutouts];

    if (senderDept !== "All Departments") {
      result = result.filter((s) => s.giver_department === senderDept);
    }

    if (receiverDept !== "All Departments") {
      result = result.filter((s) => s.receiver_department === receiverDept);
    }

    if (searchName.trim() !== "") {
      result = result.filter(
        (s) =>
          s.giver_name.toLowerCase().includes(searchName.toLowerCase()) ||
          s.receiver_name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (date) {
      result = result.filter((s) =>
        dayjs(s.created_at).isSame(dayjs(date), "day")
      );
    }

    setFiltered(result);
  }, [senderDept, receiverDept, searchName, date, shoutouts]);

  const clearFilters = () => {
    setSenderDept("All Departments");
    setReceiverDept("All Departments");
    setSearchName("");
    setDate("");
  };

  const deleteShoutout = async (shoutId) => {
    if (!confirm("Are you sure you want to delete this shoutout?")) return;
    try {
      await ApiService.deleteShoutout(shoutId);
      setShoutouts(prev =>
        prev.map(s =>
          s.id === shoutId
            ? { ...s, message: "This shoutout was deleted", image_url: null, tagged_users: [] }
            : s
        )
      );
      toast.success("Shoutout deleted successfully!"); 

    } catch (err) {
      console.error("Delete shoutout failed:", err);
    }
  };

  return (
    <div className="p-4 flex flex-col space-y-6">
      
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 text-transparent bg-clip-text">
        Shout-Out Feed
      </h2>
      <p className="text-gray-500 mb-6">Browse recognitions shared across the organization 💬</p>

      {/* Filters */}
      <motion.div
        className="bg-white p-5 rounded-3xl shadow-lg flex flex-wrap items-center gap-4 sticky top-4 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Filter className="text-gray-600" size={20} />
        <div className="flex items-center space-x-2 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Sender:</label>
          <select
            value={senderDept}
            onChange={(e) => setSenderDept(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none transition-all hover:border-blue-400"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Receiver:</label>
          <select
            value={receiverDept}
            onChange={(e) => setReceiverDept(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none transition-all hover:border-green-400"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search by sender or receiver"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="flex-1 min-w-[250px] border rounded-xl px-4 py-2 text-sm focus:outline-none shadow-sm hover:shadow-md transition-all"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm focus:outline-none shadow-sm hover:shadow-md transition-all"
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

      {/* Total Shoutouts Count */}
      <motion.div
          className="flex justify-between items-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 rounded-xl shadow border border-gray-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
      >
        <p className="text-gray-600 text-base font-medium">
           Showing <span className="text-indigo-600 font-semibold">{filtered.length}</span>{" "}
           shoutout{filtered.length !== 1 ? "s" : ""}{" "}
           {senderDept !== "All Departments" ||
           receiverDept !== "All Departments" ||
           searchName.trim() !== "" ||
           date !== ""
             ? "based on your filters 🎯"
             : "in total 🚀"}
        </p>
      </motion.div>

      {/* Feed */}
      {loading ? (
        <div className="text-center mt-6 text-gray-500">Loading feed...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center mt-2 text-pink-600 font-semibold text-lg bg-pink-50 py-4 rounded-xl mx-6 shadow-inner">
          No shoutouts match your filters!
        </div>
      ) : (
        filtered.map((shout) => (
          <motion.div
            key={shout.id}
            className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl shadow hover:shadow-xl transition-all duration-200 relative"
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

          {/* Created & Edited timestamps - visible for all */}
          <div className="flex flex-col items-end relative">
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

          {/* Menu (Edit/Delete) */}
          {shout.giver_id === currentUser.id && (
          <div className="relative mt-1">
            <button
              onClick={() => setOpenMenuId(openMenuId === shout.id ? null : shout.id)}
              className="text-gray-500 hover:text-gray-800 text-xl font-bold focus:outline-none"
            >
             ⋮
            </button>

           {openMenuId === shout.id && (
              <div className="absolute right-0 mt-2 w-28 bg-white border rounded-xl shadow-lg flex flex-col z-20">
                  <button
                    onClick={() => {
                    setEditingShoutoutId(shout.id);
                    setOpenMenuId(null);
                    }}
                    className="px-4 py-2 text-left text-sm hover:bg-blue-100 rounded-t-xl flex items-center gap-2"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                      onClick={() => {
                      deleteShoutout(shout.id);
                      setOpenMenuId(null);
                      }}
                      className="px-4 py-2 text-left text-sm hover:bg-red-100 rounded-b-xl flex items-center gap-2"
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
            {shout.receiver_name && (
              <div className="flex items-center mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                  To: {shout.receiver_name} | {shout.receiver_department || "N/A"} | {shout.receiver_role || "N/A"}
                </span>
              </div>
            )}

            {/* Edit or Message */}
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
                      <div key={u.id} className="flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100">
                        <TargetIcon size={12} className="mr-1 text-gray-700" />
                        {u.username}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}
