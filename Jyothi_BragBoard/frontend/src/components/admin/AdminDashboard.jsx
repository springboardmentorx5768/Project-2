import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building,
  Megaphone,
  Heart,
  Bell,
  CheckCircle,
  AlertTriangle,
  Trophy
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import ApiService from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalShoutouts: 0,
    totalReactions: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    topContributor: null,
    topContributors: [],
    mostTaggedUsers: [],
    topDepartments: [],
    activityTrend: []
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const statsData = await ApiService.getAdminStats();
      const topContributorsData = await ApiService.getTopContributors();
      const mostTaggedData = await ApiService.getMostTagged();
      const topDepartmentsData = await ApiService.getTopDepartments(6); // show up to 6
      const trend = await ApiService.getActivityTrend(30); // last 30 days

      setStats({
        totalUsers: statsData.total_users,
        totalDepartments: statsData.total_departments,
        totalShoutouts: statsData.total_shoutouts,
        totalReactions: statsData.total_reactions,
        totalReports: statsData.total_reports,
        pendingReports: statsData.pending_reports,
        resolvedReports: statsData.resolved_reports,
        topContributor: statsData.top_contributor,
        topContributors: topContributorsData,
        mostTaggedUsers: mostTaggedData,
        topDepartments: topDepartmentsData,
        activityTrend: trend
      });
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };

  // color constants (light background, dark icon bg)
  const COLORS = {
    indigo: { light: "bg-indigo-50", dark: "bg-indigo-700", text: "text-indigo-800" },
    blue: { light: "bg-blue-50", dark: "bg-blue-700", text: "text-blue-800" },
    pink: { light: "bg-pink-50", dark: "bg-pink-700", text: "text-pink-800" },
    red: { light: "bg-red-50", dark: "bg-red-700", text: "text-red-800" },
    yellow: { light: "bg-yellow-50", dark: "bg-yellow-700", text: "text-yellow-800" },
    orange: { light: "bg-orange-50", dark: "bg-orange-700", text: "text-orange-800" },
    green: { light: "bg-emerald-50", dark: "bg-emerald-700", text: "text-emerald-800" },
    purple: { light: "bg-purple-50", dark: "bg-purple-700", text: "text-purple-800" },
  };

  const BORDER_COLORS = {
    indigo: "border-indigo-200",
    blue: "border-blue-200",
    pink: "border-pink-200",
    red: "border-red-200",
    yellow: "border-yellow-200",
    orange: "border-orange-200",
    green: "border-emerald-200",
    purple: "border-purple-200",
  };
  
  const StatCard = ({ icon, label, value, colorKey }) => {
    const c = COLORS[colorKey] || COLORS.indigo;
    const borderClass = BORDER_COLORS[colorKey] || "border-gray-500";
  
    return (
      <motion.div
        whileHover={{ scale: 1.025 }}
        className={`${c.light} p-5 rounded-2xl shadow-sm border-1 ${borderClass} transition`}
      >
        <div className="flex items-center gap-4">
          <div className={`${c.dark} p-3 rounded-xl text-white`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`${c.text} text-2xl font-semibold mt-1`}>{value}</p>
          </div>
        </div>
      </motion.div>
    );
  };
  
  const downloadCSV = async () => {
    const blob = await ApiService.exportShoutoutsCSV();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "shoutouts.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  
  const downloadPDF = async () => {
    const blob = await ApiService.exportShoutoutsPDF();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "shoutouts.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  
  // Donut chart cells palette (match pastel/dark)
  const DEPT_COLORS = ["#C7D2FE", "#BFDBFE", "#FCE7F3", "#FEE2E2", "#FEF3C7", "#FFEDD5", "#D1FAE5", "#E9D5FF"];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
            Admin Insights Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Export CSV
            </button>
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Export PDF
            </button>
          </div>
        </div>


      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={20} />} label="Total Users" value={stats.totalUsers} colorKey="indigo" />
        <StatCard icon={<Building size={20} />} label="Departments" value={stats.totalDepartments} colorKey="blue" />
        <StatCard icon={<Megaphone size={20} />} label="Shout-outs" value={stats.totalShoutouts} colorKey="pink" />
        <StatCard icon={<Heart size={20} />} label="Reactions" value={stats.totalReactions} colorKey="red" />
        <StatCard icon={<Bell size={20} />} label="Total Reports" value={stats.totalReports} colorKey="yellow" />
        <StatCard icon={<AlertTriangle size={20} />} label="Pending Reports" value={stats.pendingReports} colorKey="orange" />
        <StatCard icon={<CheckCircle size={20} />} label="Resolved Reports" value={stats.resolvedReports} colorKey="green" />
        <StatCard icon={<Trophy size={20} />} label="Top Contributor" value={stats.topContributor || "N/A"} colorKey="purple" />
      </div>

      {/* Row: Left - Donut (Departments) | Right - Trend (Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut: Top Departments */}
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-5 bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
              Top Departments
          </h2>
          {stats.topDepartments.length ? (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div style={{ width: 220, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topDepartments}
                      dataKey="shoutout_count"
                      nameKey="department"
                      innerRadius={"55%"}
                      outerRadius={"85%"}
                      paddingAngle={4}
                    >
                      {stats.topDepartments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1">
                <ul className="space-y-3">
                  {stats.topDepartments.map((d, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }}></span>
                        <span className="text-sm font-medium text-gray-700">{d.department} </span>
                      </div>
                      <span className="pl-1 text-gray-800 font-semibold"> {d.shoutout_count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No department data available</p>
          )}
        </div>

        {/* Activity Trend: last 30 days (bar chart) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-5 bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
                Shoutouts — Last 30 days
            </h2>
            {stats.activityTrend.length ? (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.activityTrend} margin={{ top: 6, right: 8, left: 0, bottom: 6 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={3} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" barSize={14} radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">No activity data available</p>
          )}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-5 bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
              Top Contributors
          </h2>
        {stats.topContributors.length ? (
          <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.topContributors.slice(0, 5)} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" />
            <YAxis dataKey="username" type="category" width={140} tick={{ fontSize: 13 }} />
            <Tooltip 
              formatter={(value) => `${value} shoutout${value > 1 ? "s" : ""}`}  
            />
            <Bar dataKey="shoutout_count" fill="#6366F1" barSize={20} radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
        
        ) : (
          <p className="text-gray-500">No contributors found</p>
        )}
      </div>

      {/* Most Tagged Users */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-5 bg-gradient-to-r from-pink-600 to-rose-500 text-transparent bg-clip-text">
            Most Tagged Users
          </h2>
          {stats.mostTaggedUsers.length ? (
            <ul className="space-y-3">
              {stats.mostTaggedUsers.map((u, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition"
              >
              <div className="flex items-center gap-3">
                {/* Rank Circle */}
                <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700">
                  {i + 1}
                </span>

                <div>
                  <p className="font-medium text-gray-800 capitalize">{u.username}</p>
                  <p className="text-xs text-gray-500">Tagged {u.tag_count} times</p>
                </div>
              </div>

              <span className="font-semibold text-indigo-600 text-lg">
                  {u.tag_count}
              </span>
              </li>
              ))}
            </ul>
          ) : (
                <p className="text-gray-500">No tagged users yet</p>
          )}
      </div>
    </div> 
  );
}
