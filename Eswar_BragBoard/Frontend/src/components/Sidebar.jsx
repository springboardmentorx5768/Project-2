import { useState } from 'react';

const Sidebar = ({
  activeView,
  setActiveView,
  selectedDepartment,
  setSelectedDepartment,
  userDepartment,
  sidebarOpen
}) => {
  const [departmentsOpen, setDepartmentsOpen] = useState(true);

  const menuItems = [
    {
      id: 'feed',
      name: 'Shout-Out Feed',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      id: 'create',
      name: 'Create Shout-Out',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: 'my-shoutouts',
      name: 'My Shout-Outs',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      ),
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Sales' },
    { id: 'hr', name: 'Human Resources' },
    { id: 'finance', name: 'Finance' },
    { id: 'design', name: 'Design' },
    { id: 'operations', name: 'Operations' },
  ];

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border-r border-white/10 overflow-y-auto transition-all duration-300 flex flex-col`}
    >
      {/* Navigation Section */}
      <nav className="p-4 space-y-2 flex-1">
        <h3 className={`text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3 ${!sidebarOpen && 'hidden'}`}>
          Navigation
        </h3>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
              activeView === item.id
                ? 'bg-gradient-to-r from-violet-500/30 to-purple-500/30 border border-violet-500/50 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title={!sidebarOpen ? item.name : ''}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
          </button>
        ))}
      </nav>

      {/* Departments Section */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => setDepartmentsOpen(!departmentsOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 ${!sidebarOpen && 'justify-center'}`}
        >
          <span className={`text-xs font-bold text-gray-400 uppercase tracking-widest ${!sidebarOpen && 'hidden'}`}>
            Departments
          </span>
          {sidebarOpen && (
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${departmentsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
        </button>

        {departmentsOpen && sidebarOpen && (
          <div className="mt-3 space-y-2">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  selectedDepartment === dept.id
                    ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-white border border-cyan-500/50'
                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full transition-colors ${
                    selectedDepartment === dept.id ? 'bg-cyan-400' : 'bg-gray-500'
                  }`}></span>
                  {dept.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Collapsed Departments Indicator */}
        {!sidebarOpen && (
          <div className="mt-3 space-y-1 flex justify-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1 w-1 bg-gray-500 rounded-full"></div>
            ))}
          </div>
        )}
      </div>

      {/* User Department Badge */}
      {sidebarOpen && userDepartment && (
        <div className="p-4 border-t border-white/10">
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Your Department</p>
            <p className="text-sm font-semibold text-white capitalize">{userDepartment}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
