import { useState } from "react";
import {
  Home,
  MessageSquare,
  Send,
  UserCircle,
  Award,
  BarChart3,
  Settings,
  Shield,
  FileWarning,
  Trophy,
} from "lucide-react";

const Sidebar = ({ activeView, setActiveView, userRole }) => {
  const [isOpen, setIsOpen] = useState(true);

  const commonItems = [
    { id: "dashboard", name: "Dashboard", icon: <Home size={20} /> },
    { id: "feed", name: "Shout-Out Feed", icon: <MessageSquare size={20} /> },
    { id: "create", name: "Create Shout-Out", icon: <Send size={20} /> },
    { id: "my-shoutouts", name: "My Shout-Outs", icon: <UserCircle size={20} /> },
    { id: "achievements", name: "Achievements", icon: <Award size={20} /> },
    { id: "leaderboard", name: "Leaderboard", icon: <Trophy size={20} /> },
    { id: "settings", name: "Settings", icon: <Settings size={20} /> },
  ];

  const adminItems = [
    { id: "admin-dashboard", name: "Admin Dashboard", icon: <BarChart3 size={20} /> },
    { id: "moderate", name: "Moderate Posts", icon: <Shield size={20} /> },
    { id: "reports", name: "Reports", icon: <FileWarning size={20} /> },
  ];

  const menuItems = userRole === "admin" ? [...commonItems, ...adminItems] : commonItems;

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-gradient-to-b from-indigo-50 via-white to-purple-50 text-gray-800 min-h-screen p-4 flex flex-col transition-all duration-300 border-r border-gray-200 shadow-sm`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="self-end mb-4 text-gray-500 hover:text-indigo-600 transition"
      >
        {isOpen ? "←" : "→"}
      </button>

      {/* Menu Items */}
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${
              activeView === item.id
                ? "bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white shadow-md"
                : "hover:bg-indigo-100/80 hover:shadow-sm text-gray-700"
            }`}
            
          >
            <span className={activeView === item.id ? "text-white" : "text-indigo-600"}>
              {item.icon}
            </span>
            {isOpen && <span className="text-lg font-medium">{item.name}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
