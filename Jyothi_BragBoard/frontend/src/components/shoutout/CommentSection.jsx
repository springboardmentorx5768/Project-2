import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import ApiService from "../../services/api";

dayjs.extend(utc);

export default function CommentSection({ shoutoutId, currentUser, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const menuRefs = useRef({});

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [shoutoutId]);

  const fetchComments = async () => {
    try {
      const res = await ApiService.getComments(shoutoutId);
      const visible = res.filter(c => !c.is_deleted)
                        .sort((a, b) => new Date(b.edited_at || b.created_at) - new Date(a.edited_at || a.created_at));
      setComments(visible);
      onCommentCountChange?.(visible.length);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    await ApiService.addComment(shoutoutId, newComment.trim());
    fetchComments();
    setNewComment("");
  };


  const deleteComment = async (id) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const isAdmin = currentUser.role === "admin";
      if (isAdmin) await ApiService.adminDeleteComment(id);
      else await ApiService.deleteComment(id);

      // Remove locally
      setComments(prev => {
        const updated = prev.filter(c => c.id !== id);
        onCommentCountChange?.(updated.length);
        return updated;
      });
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) return;
    try {
      const updated = await ApiService.updateComment(id, editValue.trim());
      setEditingId(null);
      setEditValue("");

      // Update locally
      setComments(prev => {
        const updatedComments = prev.map(c => c.id === id ? updated : c);
        return updatedComments;
      });
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (openMenu && menuRefs.current[openMenu] && !menuRefs.current[openMenu].contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenu]);

  return (
    <div className="mt-3 space-y-4">
      {comments.length === 0 && (
        <p className="text-gray-500 text-sm">No comments yet — start the conversation ✨</p>
      )}

      {comments.map(c => (
        <div key={c.id} className="bg-white-100 border border-gray-200 rounded-xl p-3 shadow-sm">
          <div className="flex justify-between items-center" ref={el => (menuRefs.current[c.id] = el)}>
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                {c.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{c.username}</p>
                <p className="text-gray-500 text-xs">{c.department} | {c.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <p className="text-[11px] text-gray-400 whitespace-nowrap">
                {c.edited_at
                  ? `Edited: ${dayjs.utc(c.edited_at).local().format("DD MMM YYYY, hh:mm A")}`
                  : dayjs.utc(c.created_at).local().format("DD MMM YYYY, hh:mm A")}
              </p>

              {(currentUser.id === c.user_id || currentUser.role === "admin") && (
                <button
                  onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                  className="text-gray-500 hover:text-gray-800 text-lg px-1"
                >
                  ⋮
                </button>
              )}

              {openMenu === c.id && (
                <div className="absolute right-0 top-6 w-28 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                  {currentUser.id === c.user_id && (
                    <button
                      onClick={() => {
                        setEditingId(c.id);
                        setEditValue(c.content);
                        setOpenMenu(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition"
                    >
                      ✏️ Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition"
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {editingId === c.id ? (
            <div className="mt-3 flex gap-2 items-center ml-12">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 border rounded-md px-2 py-1 text-sm"
              />
              <button
                onClick={() => saveEdit(c.id)}
                disabled={editValue.trim() === comments.find(cmnt => cmnt.id === c.id)?.content.trim()}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  editValue.trim() === comments.find(cmnt => cmnt.id === c.id)?.content.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                }`}
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-gray-700 text-sm mt-2 ml-12">{c.content}</p>
          )}
        </div>
      ))}

      {/* New Comment Input */}
      <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full bg-violet-300 flex items-center justify-center text-white font-semibold">
              <span>👤</span>
          </div>
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded-xl px-3 py-2 text-sm"
        />
        <button
          onClick={postComment}
          className="bg-violet-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-violet-600 transition"
        >
          Post
        </button>
      </div>
    </div>
  );
}
