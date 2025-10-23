import Navbar from "../components/Navbar";
import "../styles/Home.scss";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Home() {
  const [user, setUser] = useState({});
  const [employeeOfMonth, setEmployeeOfMonth] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [feed, setFeed] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [message, setMessage] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentInput, setCommentInput] = useState({});

  // --------------------- Fetch Initial Data ---------------------

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    fetchUserData();
    fetchEmployeeOfMonth();
    fetchEmployees();
    fetchDepartments();
    fetchFeed();
    fetchLeaderboard();
    fetchNotifications();
  };

  const fetchUserData = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchEmployeeOfMonth = async () => {
    try {
      const { data } = await api.get("/auth/employee-of-month");
      setEmployeeOfMonth(data);
    } catch (err) {
      console.error("Error fetching Employee of Month:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/auth/department-employees");
      setEmployees(res.data || []);
    } catch (_) {}
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/auth/departments");
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchFeed = async () => {
    try {
      const { data } = await api.get("/auth/shoutouts/feed");
      setFeed(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get("/auth/leaderboard");
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/auth/notifications");
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // --------------------- Shoutout Post ---------------------
  const submitShoutOut = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const form = new FormData();
      form.append("message", message);
      if (selectedTags.length)
        form.append("tagged_user_ids", selectedTags.join(","));
      if (imageFile) form.append("image", imageFile);

      await api.post("/auth/shoutouts", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("");
      setSelectedTags([]);
      setImageFile(null);
      fetchFeed();
    } catch (err) {
      console.error("Error posting shoutout:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (id) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const react = async (id, emoji) => {
    try {
      await api.post(`/auth/shoutouts/${id}/react`, { emoji });
      fetchFeed();
    } catch (err) {
      console.error("Error reacting:", err);
    }
  };

  const toggleComments = async (id) => {
    setCommentsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!commentsMap[id]) {
      try {
        const { data } = await api.get(`/auth/shoutouts/${id}/comments`);
        setCommentsMap((m) => ({ ...m, [id]: data }));
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    }
  };

  const submitComment = async (id) => {
    const text = (commentInput[id] || "").trim();
    if (!text) return;
    try {
      const { data } = await api.post(`/auth/shoutouts/${id}/comments`, {
        content: text,
      });
      setCommentsMap((m) => ({ ...m, [id]: [...(m[id] || []), data] }));
      setCommentInput((ci) => ({ ...ci, [id]: "" }));
      fetchFeed();
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  // --------------------- Render ---------------------
  return (
    <>
      <Navbar />
      <div className="home-container">
        {/* LEFT BAR */}
        <aside className="left-sidebar">
          <div className="profile-card">
            <div className="avatar">{user.name?.charAt(0)}</div>
            <div className="profile-info">
              <strong>{user.name}</strong>
              <div>Appreciation Score: {user.appreciation_score || 0}</div>
            </div>
          </div>

          <div className="employee-month-card">
            <h3>Employee of the Month</h3>
            <div>{employeeOfMonth.name || "—"}</div>
            <div>Points: {employeeOfMonth.points || 0}</div>
          </div>
        </aside>

        {/* CENTER BAR */}
        <main className="content">
          {/* CREATE POST */}
          <div className="create-post">
            <h2>Create a Post</h2>
            <form className="shoutout-form" onSubmit={submitShoutOut}>
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="selected-tags">
                  {selectedTags.map((id) => {
                    const emp = employees.find((e) => e.id === id);
                    return (
                      <span key={id} className="tag active">
                        @{emp?.name || `ID:${id}`}
                        <button type="button" onClick={() => toggleTag(id)}>
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Message */}
              <textarea
                placeholder="Write something..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {/* Form row: Image + Employee tags */}
              <div className="form-row">
                {/* Image Upload */}
                <label className="file-input">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </label>

                {/* Employee Buttons for Tagging */}
                <div className="tags">
                  {employees.map((e) => (
                    <button
                      type="button"
                      key={e.id}
                      className={
                        selectedTags.includes(e.id) ? "tag active" : "tag"
                      }
                      onClick={() => toggleTag(e.id)}
                    >
                      @{e.name || e.id}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Posting..." : "Post Shout-out"}
              </button>
            </form>
          </div>

          {/* FEED */}
          <div className="feed">
            {feed.map((s) => (
              <div key={s.id} className="card shout">
                <div className="meta">
                  <div className="author">{s.author_name || "Anonymous"}</div>
                  <div className="time">
                    {s.created_at?.replace("T", " ").slice(0, 16)}
                  </div>
                </div>
                <div className="message">{s.message}</div>
                {s.image_url && (
                  <img
                    src={`http://127.0.0.1:8000${s.image_url}`}
                    alt="shout"
                    className="image"
                  />
                )}
                {s.tagged_user_names?.length > 0 && (
                  <div className="tags-line">
                    Tagged:{" "}
                    {s.tagged_user_names.map((n, i) => (
                      <span key={i} className="tag-ref">
                        @{n}
                      </span>
                    ))}
                  </div>
                )}

                {/* REACTIONS + COMMENTS (Unified row) */}
                <div className="interaction-bar">
                  {/* Left: reactions */}
                  <div className="reactions">
                    {Object.entries(s.reactions || {}).map(([emoji, count]) => (
                      <span key={emoji} className="reaction-count">
                        {emoji} {count}
                      </span>
                    ))}

                    <div className="reaction-buttons">
                      {["👍", "🎉", "🙏", "❤️", "🔥"].map((emo) => (
                        <button key={emo} onClick={() => react(s.id, emo)}>
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: comments toggle */}
                  <div className="comments">
                    <button
                      type="button"
                      className="toggle-button"
                      onClick={() => toggleComments(s.id)}
                    >
                      💬 Comments ({s.comments_count || 0})
                    </button>
                  </div>
                </div>

                {/* COMMENTS BODY (shown when open) */}
                {commentsOpen[s.id] && (
                  <div className="comments-body">
                    <ul className="comment-list">
                      {(commentsMap[s.id] || []).map((c) => (
                        <li key={c.id} className="comment-item">
                          <div className="comment-header">
                            <strong className="comment-author">
                              {c.user_name || "User"}
                            </strong>
                            <span className="comment-date">
                              {c.created_at?.replace("T", " ").slice(0, 16)}
                            </span>
                          </div>
                          <div className="comment-text">{c.content}</div>
                        </li>
                      ))}
                    </ul>

                    <div className="comment-form">
                      <input
                        type="text"
                        value={commentInput[s.id] || ""}
                        onChange={(e) =>
                          setCommentInput((ci) => ({
                            ...ci,
                            [s.id]: e.target.value,
                          }))
                        }
                        placeholder="Write a comment..."
                      />
                      <button type="button" onClick={() => submitComment(s.id)}>
                        Add Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT BAR */}
        <aside className="right-sidebar">
          <div className="card leaderboard">
            <h3>Leaderboard</h3>
            {leaderboard.map((l, i) => (
              <div key={l.id} className="lb-item">
                {i + 1}. {l.name} - {l.points} pts
              </div>
            ))}
          </div>

          <div className="card notifications">
            <h3>Notifications</h3>
            {notifications.map((n) => (
              <div key={n.id}>{n.message}</div>
            ))}
          </div>

          <div className="card departments">
            <h3>Departments & Employees</h3>
            {departments.map((d) => (
              <div key={d.id}>
                <strong>{d.name}</strong>
                <ul>
                  {d.employees?.map((e) => (
                    <li key={e.id}>{e.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
