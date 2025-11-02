import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function ShoutoutFeed() {
  const [allShoutouts, setAllShoutouts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [reactionCounts, setReactionCounts] = useState({});
  const [userReactions, setUserReactions] = useState({});

  const [senderFilter, setSenderFilter] = useState("");
  const [recipientFilter, setRecipientFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filtersActive = useRef(false);

  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReactions = async (id) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/reactions/${id}`, { headers });
      setReactionCounts((prev) => ({ ...prev, [id]: res.data.counts }));
      setUserReactions((prev) => ({ ...prev, [id]: res.data.user_reacted }));
    } catch (err) {
      console.error("Error fetching reactions:", err);
    }
  };

  const toggleReaction = async (id, type) => {
  const userReacted = userReactions[id] || [];
  const counts = { ...reactionCounts[id] };

  const alreadyReacted = userReacted.includes(type);

  // optimistic update
  if (alreadyReacted) {
    counts[type] = (counts[type] || 1) - 1;
    setUserReactions((prev) => ({
      ...prev,
      [id]: prev[id].filter((r) => r !== type),
    }));
  } else {
    counts[type] = (counts[type] || 0) + 1;
    setUserReactions((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), type],
    }));
  }
  setReactionCounts((prev) => ({ ...prev, [id]: counts }));

  // send to backend
  try {
    await axios.post(
      "http://127.0.0.1:8000/reactions/toggle",
      { shoutout_id: id, type },
      { headers }
    );
  } catch (err) {
    console.error("Error toggling reaction:", err);
    // rollback if failed
    fetchReactions(id);
  }
};


  const fetchShoutouts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/shoutouts", { headers });
      const data = Array.isArray(res.data) ? res.data : [];
      setAllShoutouts(data);
      if (!filtersActive.current) setFiltered(data);
      setError("");

      // Fetch comments for each shoutout
      const allComments = {};
      for (const s of data) {
        const cRes = await axios.get(`http://127.0.0.1:8000/comments/${s.id}`, { headers });
        allComments[s.id] = cRes.data;
        await fetchReactions(s.id);
      }
      setComments(allComments);
    } catch (err) {
      console.error("Error fetching shoutouts:", err);
      const msg = err.response?.data?.detail || err.message || "Failed to fetch shoutouts.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoutouts();
    const interval = setInterval(fetchShoutouts, 30000);
    return () => clearInterval(interval);
  }, []);

  const applyFilters = () => {
    filtersActive.current = true;
    const filteredData = allShoutouts.filter((s) => {
      const senderMatch = senderFilter
        ? (s.sender_name || "").toLowerCase().includes(senderFilter.toLowerCase())
        : true;
      const recipientMatch = recipientFilter
        ? (s.recipient_names || [])
            .join(", ")
            .toLowerCase()
            .includes(recipientFilter.toLowerCase())
        : true;
      const dateMatch = dateFilter
        ? new Date(s.created_at).toLocaleDateString() ===
          new Date(dateFilter).toLocaleDateString()
        : true;
      return senderMatch && recipientMatch && dateMatch;
    });
    setFiltered(filteredData);
  };

  const clearFilters = () => {
    filtersActive.current = false;
    setSenderFilter("");
    setRecipientFilter("");
    setDateFilter("");
    setFiltered(allShoutouts);
  };

  const handleAddComment = async (shoutoutId) => {
    const content = newComment[shoutoutId];
    if (!content || !content.trim()) return;

    try {
      await axios.post(
        "http://127.0.0.1:8000/comments",
        { shoutout_id: shoutoutId, content },
        { headers }
      );

      const res = await axios.get(`http://127.0.0.1:8000/comments/${shoutoutId}`, { headers });
      setComments((prev) => ({ ...prev, [shoutoutId]: res.data }));
      setNewComment((prev) => ({ ...prev, [shoutoutId]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilters();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 bg-gray-900 overflow-y-auto px-8 py-10">
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-8 text-blue-400 text-center">📢 Shoutout Feed</h1>

          {/* Filters */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 mb-8 w-full">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">🔍 Filter Shoutouts</h2>
            <div onKeyDown={handleKeyDown} className="flex flex-wrap gap-4 justify-center">
              <input
                type="text"
                placeholder="Sender name"
                value={senderFilter}
                onChange={(e) => setSenderFilter(e.target.value)}
                className="bg-gray-700 px-4 py-2 rounded-xl text-white w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Receiver name"
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
                className="bg-gray-700 px-4 py-2 rounded-xl text-white w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-gray-700 px-4 py-2 rounded-xl text-white w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={applyFilters}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl text-white font-semibold"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-xl text-white font-semibold"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Shoutouts */}
          {loading ? (
            <p className="text-center text-gray-400">Loading shoutouts...</p>
          ) : error ? (
            <div>
              <p className="text-center text-red-400">{error}</p>
              <p className="text-center text-gray-400 mt-4">
                Check backend logs (server console) for details.
              </p>
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 hover:bg-gray-750 transition"
                >
                  <p className="text-blue-400 font-semibold">
                    {(s.sender_name || "Unknown")} ➜{" "}
                    {s.recipient_names?.length ? s.recipient_names.join(", ") : "All"}
                  </p>
                  <p className="text-gray-300 mt-3 leading-relaxed">{s.message}</p>
                  {s.image_url && (
                    <img
                      src={`http://127.0.0.1:8000${s.image_url}`}
                      alt="shoutout"
                      className="mt-3 rounded-xl max-h-48 object-cover"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {s.created_at ? new Date(s.created_at).toLocaleString() : ""}
                  </p>

                  {/* 🧡 Reactions */}
                  <div className="flex justify-around mt-4">
                    {["like", "clap", "star"].map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleReaction(s.id, type)}
                        className={`px-3 py-1 rounded-xl text-sm transition ${
                          userReactions[s.id]?.includes(type)
                            ? "bg-blue-600"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        {type === "like" ? "👍" : type === "clap" ? "👏" : "⭐"}{" "}
                        {reactionCounts[s.id]?.[type] || 0}
                      </button>
                    ))}
                  </div>

                  {/* 💬 Comments */}
                  <div className="mt-4 bg-gray-700 p-3 rounded-xl">
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">💬 Comments</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {(comments[s.id] || []).length > 0 ? (
                        comments[s.id].map((c) => (
                          <p key={c.id} className="text-sm">
                            <b className="text-blue-400">{c.user_name}:</b> {c.content}
                          </p>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">No comments yet</p>
                      )}
                    </div>

                    <div className="flex mt-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment[s.id] || ""}
                        onChange={(e) =>
                          setNewComment({ ...newComment, [s.id]: e.target.value })
                        }
                        className="flex-1 bg-gray-600 px-3 py-1 rounded-l-xl focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(s.id)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-r-xl text-sm"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center mt-10">No shoutouts found 😔</p>
          )}
        </div>
      </main>
    </div>
  );
}
