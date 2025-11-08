const Sidebar = ({ activeView, setActiveView, selectedDepartment, setSelectedDepartment, userDepartment, userRole }) => {
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'feed',
      name: 'Shout-Out Feed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    {
      id: 'create',
      name: 'Create Shout-Out',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      id: 'leaderboard',
      name: 'Leaderboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      id: 'my-shoutouts',
      name: 'My Shout-Outs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'users',
      name: 'Manage Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      adminOnly: true
    },
    {
      id: 'activity',
      name: 'Activity Log',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      adminOnly: true
    }
  ]

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Sales' },
    { id: 'hr', name: 'Human Resources' },
    { id: 'finance', name: 'Finance' },
    { id: 'design', name: 'Design' },
    { id: 'operations', name: 'Operations' }
  ]

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm shadow-lg border-r border-white/20 h-full overflow-y-auto">
      <div className="p-6">
        {/* Navigation Menu */}
        <nav className="space-y-2 mb-8">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Navigation
          </h3>
          {menuItems.filter(item => !item.adminOnly || userRole === 'admin').map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:text-primary-700'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
              {item.adminOnly && (
                <span className="ml-auto text-xs bg-white/30 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Department Filter */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center justify-between">
            Department Filter
            <span className="text-xs text-gray-500 normal-case font-normal">Click to view activity</span>
          </h3>
          <div className="space-y-2">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => {
                  setSelectedDepartment(dept.id);
                  setActiveView('department-activity');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                  selectedDepartment === dept.id && activeView === 'department-activity'
                    ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-800 font-medium border-2 border-primary-300'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{dept.name}</span>
                  {dept.id === userDepartment?.toLowerCase() && (
                    <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full border border-success-300">
                      Your Dept
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-3 rounded-lg border-2 border-primary-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700 font-medium">Shout-Outs Given</span>
                <span className="text-lg font-bold text-primary-800">0</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-secondary-50 to-primary-50 p-3 rounded-lg border-2 border-secondary-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-700 font-medium">Shout-Outs Received</span>
                <span className="text-lg font-bold text-secondary-800">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
