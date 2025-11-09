import { useState } from "react";
import ApiService from "../../services/api";
import { toast } from "react-hot-toast"; // optional, for notifications

export default function ShoutOutActions({ shout, currentUser, refreshShoutouts }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reporting, setReporting] = useState(false);

  const handleReport = async () => {
    const reason = prompt("Please enter the reason for reporting this shoutout:");
    if (!reason || !reason.trim()) return;

    setReporting(true);
    try {
      await ApiService.reportShoutout(shout.id, reason.trim());
      toast.success("Report submitted successfully!");
      setMenuOpen(false);
    } catch (err) {
      console.error("Report failed:", err);
      toast.error("Failed to submit report");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
      >
        ⋮
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-xl shadow-lg w-36 overflow-hidden z-50">
          {/* Edit/Delete only for owner/admin */}
          {(shout.giver_id === currentUser.id || currentUser.role === "admin") && (
            <>
              {shout.giver_id === currentUser.id && (
                <button
                  onClick={() => {
                    // existing edit logic
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition"
                >
                  ✏️ Edit
                </button>
              )}
              <button
                onClick={() => {
                  // existing delete logic
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition"
              >
                🗑 Delete
              </button>
            </>
          )}

          {/* Report only for other users */}
          {shout.giver_id !== currentUser.id && (
            <button
              onClick={handleReport}
              disabled={reporting}
              className="w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50 transition"
            >
              {reporting ? "Reporting..." : "🚩 Report"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
