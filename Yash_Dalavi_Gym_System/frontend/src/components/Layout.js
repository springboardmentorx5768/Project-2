import React from 'react';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // New Icon

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-300">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Gym Admin</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
            <DashboardIcon className="mr-3" />
            Dashboard
          </Link>
          {/* --- NEW LINK ADDED BELOW --- */}
          <Link to="/brag-board" className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
            <EmojiEventsIcon className="mr-3" />
            Brag Board
          </Link>
          <Link to="/members" className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
            <GroupIcon className="mr-3" />
            Members
          </Link>
          <Link to="/settings" className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
            <SettingsIcon className="mr-3" />
            Settings
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-800">Welcome, Admin!</h2>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 flex justify-center items-start">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;