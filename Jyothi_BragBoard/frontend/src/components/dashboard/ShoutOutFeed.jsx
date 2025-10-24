import { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import ApiService from "../../services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(relativeTime);

export default function ShoutOutFeed({
  currentUser,
  shoutouts: initialShoutouts,
  shoutoutUpdated,
  handleDeleteShout
}) {
  const [shoutouts, setShoutouts] = useState(initialShoutouts || []);
  const [loading, setLoading] = useState(!initialShoutouts);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);

  const fetchShoutouts = async () => {
    try {
      const res = await ApiService.getShoutouts();
      const visible = res.filter(
        (s) =>
          s.is_public || s.giver_id === currentUser.id || s.receiver_id === currentUser.id
      );
      setShoutouts(visible);
    } catch (err) {
      console.error("Failed to fetch shoutouts", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount if no initial shoutouts
  useEffect(() => {
    if (!initialShoutouts) fetchShoutouts();
  }, []);

  // Refetch when shoutoutUpdated toggles
  useEffect(() => {
    if (shoutoutUpdated) fetchShoutouts();
  }, [shoutoutUpdated]);

  const toggleReaction = async (shoutId, type) => {
    setShoutouts((prev) =>
      prev.map((s) => {
        if (s.id === shoutId) {
          const hasReacted = s[type]?.includes(currentUser.id);
          return {
            ...s,
            [type]: hasReacted
              ? s[type].filter((id) => id !== currentUser.id)
              : [...(s[type] || []), currentUser.id],
          };
        }
        return s;
      })
    );

    try {
      const shout = shoutouts.find((s) => s.id === shoutId);
      const hasReacted = shout[type]?.includes(currentUser.id);
      if (hasReacted) await ApiService.removeReaction(shoutId, type);
      else await ApiService.addReaction(shoutId, type);
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  const addComment = async (shoutId, text, resetInput) => {
    if (!text.trim()) return;
    try {
      await ApiService.addComment(shoutId, { user_id: currentUser.id, text });
      fetchShoutouts();
      resetInput();
    } catch (err) {
      console.error("Add comment failed:", err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await ApiService.deleteComment(commentId);
      fetchShoutouts();
    } catch (err) {
      console.error("Delete comment failed:", err);
    }
  };

  const editComment = async (shoutId, commentId, currentText) => {
    const newText = prompt("Edit your comment:", currentText);
    if (!newText || newText.trim() === "" || newText === currentText) return;
    try {
      await ApiService.updateComment(shoutId, commentId, { text: newText });
      fetchShoutouts();
    } catch (err) {
      console.error("Edit comment failed:", err);
    }
  };

  if (!currentUser) return <div className="text-center mt-6 text-gray-500">Loading user...</div>;
  if (loading) return <div className="text-center mt-6 text-gray-500">Loading feed...</div>;
  if (!shoutouts.length) return <div className="text-center mt-6 text-gray-500">No shoutouts yet!</div>;

  return (
    <div className="flex flex-col space-y-6 p-4">
      {shoutouts.map((shout) => (
        <div key={shout.id} className="bg-white p-6 rounded-lg shadow hover:shadow-xl relative w-full">
          {/* Timestamp */}
          <p className="absolute top-4 right-4 text-gray-400 text-sm">
            {dayjs.utc(shout.created_at).local().fromNow()}
          </p>

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {shout.giver_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{shout.giver_name}</p>
                <p className="text-gray-500 text-xs">{`${shout.giver_department || "N/A"} | ${shout.giver_role || "N/A"}`}</p>
              </div>
            </div>

            {shout.giver_id === currentUser.id && (
              <div className="relative">
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setOpenMenuId(openMenuId === shout.id ? null : shout.id)}
                >
                  <MoreVertical size={16} />
                </button>
                {openMenuId === shout.id && (
                  <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded shadow-md z-10">
                    <button
                      onClick={() => handleDeleteShout(shout.id)}
                      className="w-full text-left px-3 py-1 text-red-500 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-gray-700 my-2">{shout.message}</p>

          {/* Reactions */}
          <div className="flex items-center space-x-4 mt-3">
            <button
              onClick={() => toggleReaction(shout.id, "likes")}
              className={`flex items-center space-x-1 ${
                shout.likes?.includes(currentUser.id) ? "text-blue-500 font-bold" : "text-gray-500"
              }`}
            >
              👍 <span>{shout.likes?.length || 0}</span>
            </button>
            <button
              onClick={() => toggleReaction(shout.id, "claps")}
              className={`flex items-center space-x-1 ${
                shout.claps?.includes(currentUser.id) ? "text-yellow-500 font-bold" : "text-gray-500"
              }`}
            >
              👏 <span>{shout.claps?.length || 0}</span>
            </button>
            <div className="flex items-center space-x-1 text-gray-500">💬 <span>{shout.comments?.length || 0}</span></div>
          </div>

          {/* Comments */}
          <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
            {shout.comments?.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded p-3 flex flex-col space-y-1 relative">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {c.user?.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-800 text-sm">{c.user?.username}</p>
                    <p className="text-gray-500 text-xs">{c.user?.department}{c.user?.role ? ` | ${c.user.role}` : ""}</p>
                  </div>

                  {c.user?.id === currentUser.id && (
                    <div className="ml-auto relative">
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setOpenCommentMenuId(openCommentMenuId === c.id ? null : c.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openCommentMenuId === c.id && (
                        <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded shadow-md z-10">
                          <button onClick={() => editComment(shout.id, c.id, c.text)} className="w-full text-left px-3 py-1 text-gray-700 hover:bg-gray-100">Edit</button>
                          <button onClick={() => deleteComment(c.id)} className="w-full text-left px-3 py-1 text-red-500 hover:bg-gray-100">Delete</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-gray-700 pl-9 text-sm">{c.text}</p>
              </div>
            ))}
            <CommentInput shoutId={shout.id} onAdd={addComment} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentInput({ shoutId, onAdd }) {
  const [text, setText] = useState("");
  return (
    <div className="flex mt-2 space-x-2">
      <input
        type="text"
        placeholder="Add a comment..."
        className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:border-blue-300"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd(shoutId, text, () => setText(""))}
      />
      <button
        onClick={() => onAdd(shoutId, text, () => setText(""))}
        className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
      >
        Post
      </button>
    </div>
  );
}
