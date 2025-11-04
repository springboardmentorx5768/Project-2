const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-white via-indigo-50 to-purple-50 backdrop-blur-sm shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="h-9 w-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-sm">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 
                  3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 
                  3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 
                  3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 
                  3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 
                  3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 
                  3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 
                  3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 
                  3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              BragBoard
            </h1>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Department */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-gray-600">Department:</span>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                {user?.department || "N/A"}
              </span>
            </div>

            {/* Role */}
            <div className="hidden sm:flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {user?.role === "admin" ? "👑 Admin" : "👤 Employee"}
              </span>
            </div>

            {/* Username */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-gray-700 font-medium hidden sm:block">
                {user?.username || "User"}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 
                  0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
