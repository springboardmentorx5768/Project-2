import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState("");
  const [shoutouts, setShoutouts] = useState([]);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const textareaRef = useRef(null);

  const departments = ["IT", "HR", "Finance", "Marketing", "Operations"];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUserName(data.name))
      .catch((err) => console.error("Error fetching user info:", err));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/shoutouts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setShoutouts(data))
      .catch((err) => console.error("Error fetching shoutouts:", err));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return alert("Please enter a message");

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/shoutouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          department: department || null,
          recipient_ids: selectedRecipients,
        }),
      });

      if (res.ok) {
        const newShoutout = await res.json();
        setShoutouts((prev) => [newShoutout, ...prev]);
        setMessage("");
        setDepartment("");
        setSelectedRecipients([]);
      } else {
        console.error("Failed to create shoutout:", await res.text());
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    const pos = e.target.selectionStart;
    setMessage(value);
    setCursorPosition(pos);

    const textUpToCursor = value.slice(0, pos);
    const match = textUpToCursor.match(/@(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const suggestions = users.filter(
        (u) =>
          u.name.toLowerCase().includes(query) &&
          !selectedRecipients.includes(u.id)
      );
      setMentionSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addMention = (user) => {
    const textUpToCursor = message.slice(0, cursorPosition);
    const textAfterCursor = message.slice(cursorPosition);
    const newText =
      textUpToCursor.replace(/@(\w*)$/, `@${user.name} `) + textAfterCursor;
    setMessage(newText);
    setSelectedRecipients((prev) => [...prev, user.id]);
    setShowSuggestions(false);

    setTimeout(() => {
      if (textareaRef.current) {
        const pos = textUpToCursor.replace(/@(\w*)$/, `@${user.name} `).length;
        textareaRef.current.setSelectionRange(pos, pos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 flex flex-col shadow-lg">
        <div className="p-6 text-2xl font-bold text-white border-b border-blue-600">
          BragBoard
        </div>
        <nav className="flex-1 p-4 space-y-3">
          {[
            { name: "Dashboard", icon: "🏠", key: "dashboard" },
            { name: "Profile", icon: "👤", key: "profile" },
            { name: "Settings", icon: "⚙️", key: "settings" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full text-left px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition duration-300 ${
                activeTab === item.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-blue-100 text-gray-900 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <span>{item.icon}</span> {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto w-full">
        {activeTab === "dashboard" && (
          <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
              Welcome, {userName || "User"} 🎉
            </h1>

            {/* Create Shoutout */}
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Create a Shoutout 🎊
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                    rows="4"
                    placeholder="Write your appreciation message..."
                    value={message}
                    onChange={handleMessageChange}
                  ></textarea>

                  {showSuggestions && mentionSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border rounded shadow-lg w-full mt-1 max-h-40 overflow-y-auto text-gray-800">
                      {mentionSuggestions.map((u) => (
                        <li
                          key={u.id}
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                          onClick={() => addMention(u)}
                        >
                          {u.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <select
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold text-lg"
                >
                  {loading ? "Posting..." : "Post Shoutout 🎉"}
                </button>
              </form>
            </div>

            {/* Shoutouts */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
                Recent Shoutouts
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {shoutouts.length === 0 ? (
                  <p className="text-gray-500 text-center">No shoutouts yet.</p>
                ) : (
                  shoutouts.map((s) => {
                    const recipientNames = s.recipient_ids
                      ?.map((id) => users.find((u) => u.id === id)?.name)
                      .filter(Boolean);

                    let displayMessage = s.message;
                    if (recipientNames && recipientNames.length > 0) {
                      recipientNames.forEach((name) => {
                        const regex = new RegExp(`@${name}\\b`, "g");
                        displayMessage = displayMessage
                          .replace(regex, "")
                          .trim();
                      });
                    }

                    return (
                      <div
                        key={s.id}
                        className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <p className="font-medium text-gray-900">
                          {displayMessage}{" "}
                          {recipientNames &&
                            recipientNames.map((name) => (
                              <span
                                key={name}
                                className="text-blue-600 font-semibold"
                              >
                                @{name}{" "}
                              </span>
                            ))}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Sender: {s.sender_name} | Department:{" "}
                          {s.sender_department}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="w-full max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              👤 Your Profile
            </h2>
            <p className="text-lg text-gray-700 mb-3">
              <strong>Name:</strong> {userName}
            </p>
            <p className="text-lg text-gray-700 mb-3">
              <strong>Email:</strong> (Fetched from API)
            </p>
            <p className="text-lg text-gray-700">
              <strong>Role:</strong> User
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="w-full max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">⚙️ Settings</h2>
            <p className="text-lg text-gray-700">
              Customize your experience here (coming soon).
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
