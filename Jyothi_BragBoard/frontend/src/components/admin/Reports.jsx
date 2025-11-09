import { useEffect, useState } from "react";
import ApiService from "../../services/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toast } from "react-hot-toast";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function Reports({ currentUser }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShoutout, setSelectedShoutout] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [filter, setFilter] = useState("all");

  const fetchReports = async (filterType = "all") => {
    setLoading(true);
    try {
      const res = await ApiService.getReports(filterType); // 'all', 'pending', 'resolved'
      setReports(res);

      const total = res.length;
      const pending = res.filter(r => r.report_status === "pending").length;
      const resolved = res.filter(r => r.report_status === "resolved").length;
      setStats({ total, pending, resolved });
      setFilter(filterType);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (reportId) => {
    try {
      const res = await ApiService.resolveReport(reportId);
      toast.success(res.message || "Report resolved");
      fetchReports(filter);
    } catch (err) {
      console.error("Failed to resolve report:", err);
      toast.error("Failed to resolve report");
    }
  };

  const handleDeleteShoutout = async (shoutoutId, status) => {
    if (status === "Deleted") return;
    if (!window.confirm("Are you sure you want to DELETE this shoutout?")) return;
    try {
      await ApiService.adminDeleteShoutout(shoutoutId);
      toast.success("Shoutout deleted");
      fetchReports(filter);
    } catch (err) {
      console.error("Failed to delete shoutout:", err);
      toast.error("Failed to delete shoutout");
    }
  };

  const handleViewShoutout = async (shoutoutId) => {
    try {
      const data = await ApiService.getShoutout(shoutoutId);
      setSelectedShoutout(data);
    } catch (err) {
      console.error("Failed to load shoutout:", err);
      toast.error("Failed to load shoutout");
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
          Reported Shoutouts
        </h1>
        <p className="text-gray-500">
          Review reported shoutouts and take moderation actions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Reports" value={stats.total} color="blue" />
        <StatCard label="Pending Reports" value={stats.pending} color="yellow" />
        <StatCard label="Resolved Reports" value={stats.resolved} color="green" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        {["all", "pending", "resolved"].map(f => {
          const active = filter === f;
          const colors = {
            all: "bg-gray-100 hover:bg-gray-200 text-gray-700",
            pending: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800",
            resolved: "bg-green-100 hover:bg-green-200 text-green-800"
          };
          return (
            <button
              key={f}
              onClick={() => fetchReports(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${colors[f]} ${active ? "ring-2 ring-indigo-400" : ""}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["#", "Reporter", "Reported User", "Reason", "View", "Report Submitted", "Action", "Report Status", "Shoutout Status", "Handled By"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">Loading...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">No reports found.</td>
              </tr>
            ) : (
              reports.map((r, idx) => (
                <tr key={r.report_id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 text-sm">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm">{r.reporter_name}</td>
                  <td className="px-4 py-2 text-sm">{r.reported_username}</td>
                  <td className="px-4 py-2 text-sm">{r.reason}</td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => handleViewShoutout(r.shoutout_id)}
                      className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600 transition"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {dayjs.utc(r.report_submitted).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A")}
                  </td>
                  {/* Centered Action Buttons */}
                  <td className="mt-3 px-4 py-2 text-sm flex items-center justify-center gap-2">
                    <button
                      className={`px-2 py-1 rounded text-xs font-semibold text-white ${r.report_status === "resolved" ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                      disabled={r.report_status === "resolved"}
                      onClick={() => handleResolve(r.report_id)}
                    >
                      Resolve
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-xs font-semibold text-white ${r.shoutout_status === "Deleted" ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
                      disabled={r.shoutout_status === "Deleted"}
                      onClick={() => handleDeleteShoutout(r.shoutout_id, r.shoutout_status)}
                    >
                      Delete
                    </button>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${r.report_status === "resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.report_status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${r.shoutout_status === "Deleted" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {r.shoutout_status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{r.admin_name || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Shoutout Modal */}
      {selectedShoutout && (
         <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedShoutout(null)}></div>
            {/* Shoutout Card */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-50 pointer-events-auto transform transition-transform duration-300 scale-100">
                <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">Shoutout Details</h2>
                <button
                   onClick={() => setSelectedShoutout(null)}
                   className="text-gray-500 hover:text-gray-900 font-bold text-lg"
                >
                  ×
                </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {selectedShoutout.giver_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-gray-800 font-medium">{selectedShoutout.giver_name}</span>
              <span className="text-gray-500 text-sm">To: {selectedShoutout.receiver_name}</span>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">Category:</span> {selectedShoutout.category}
          </p>
          <p className="text-gray-800 mb-3">{selectedShoutout.message}</p>
          {selectedShoutout.image_url && (
            <img
              src={selectedShoutout.image_url}
              alt="shoutout"
              className="w-full max-h-64 object-cover rounded-lg mb-3"
            />
          )}

          <p className="text-xs text-gray-400">
             Created at: {dayjs.utc(selectedShoutout.created_at).local().format("DD MMM YYYY, hh:mm A")}
          </p>
       </div>
      </div>
      )}

    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border border-blue-200",
    yellow: "text-yellow-600 bg-yellow-50 border border-yellow-200",
    green: "text-green-600 bg-green-50 border border-green-200",
  };
  return (
    <div className={`rounded-2xl p-5 text-center shadow-md ${colorMap[color]}`}>
      <p className="text-gray-600 font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
