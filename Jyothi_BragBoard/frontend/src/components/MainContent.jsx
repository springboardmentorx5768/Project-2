const MainContent = ({ activeView, selectedDepartment, user }) => {
    const renderContent = () => {
      switch (activeView) {
        case 'feed':
          return <ShoutOutFeed selectedDepartment={selectedDepartment} user={user} />
        case 'create':
          return <CreateShoutOut user={user} />
        case 'my-shoutouts':
          return <MyShoutOuts user={user} />
        case 'analytics':
          return <Analytics user={user} />
        default:
          return <ShoutOutFeed selectedDepartment={selectedDepartment} user={user} />
      }
    }
  
    return (
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    )
  }
  
  // Shout-Out Feed Component
  const ShoutOutFeed = ({ selectedDepartment, user }) => {
    return (
      <div className="space-y-6">
        {/* Feed Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Shout-Out Feed
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedDepartment === 'all' 
                  ? 'Showing shout-outs from all departments' 
                  : `Showing shout-outs from ${selectedDepartment} department`
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                🎉 0 Shout-Outs
              </span>
            </div>
          </div>
        </div>
  
        {/* Empty State */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 border border-white/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Shout-Outs Yet</h3>
          <p className="text-gray-600 mb-6">
            Be the first to spread some positivity! Create a shout-out to appreciate your colleagues.
          </p>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
            Create Your First Shout-Out
          </button>
        </div>
      </div>
    )
  }
  
  // Create Shout-Out Component
  const CreateShoutOut = ({ user }) => {
    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            Create Shout-Out
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Coming Soon!</h3>
            <p className="text-blue-700">
              The shout-out creation form will be implemented in Week 3-4 of the project timeline.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  // My Shout-Outs Component
  const MyShoutOuts = ({ user }) => {
    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            My Shout-Outs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Shout-Outs Given</h3>
              <div className="text-3xl font-bold text-green-700 mb-2">0</div>
              <p className="text-green-600 text-sm">Appreciations you've shared</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Shout-Outs Received</h3>
              <div className="text-3xl font-bold text-blue-700 mb-2">0</div>
              <p className="text-blue-600 text-sm">Appreciations you've received</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Analytics Component
  const Analytics = ({ user }) => {
    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            Analytics Dashboard
          </h2>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Analytics Coming Soon!</h3>
            <p className="text-purple-700">
              Detailed analytics and insights will be available in Week 7-8 of the project timeline.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  export default MainContent