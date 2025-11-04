import { useState } from 'react';

const Header = ({ user, onLogout, sidebarOpen, setSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50 shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                BragBoard
              </h1>
              <p className="text-xs text-gray-400">Celebrate Achievements</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          
          {/* Search Bar (Optional) */}
          <div className="hidden md:flex items-center bg-white/10 border border-white/20 rounded-xl px-4 py-2 hover:bg-white/15 transition-all duration-200">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-0 outline-none text-white placeholder-gray-500 ml-3 w-40 text-sm"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-gray-300 hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <div className="flex flex-col items-end">
                <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.role || 'Employee'}</p>
              </div>
              <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-xl border border-white/20 shadow-2xl overflow-hidden animate-slideInDown">
                <div className="p-4 border-b border-white/10">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <a href="#" className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                  👤 Profile
                </a>
                <a href="#" className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                  ⚙️ Settings
                </a>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-white/10"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;
