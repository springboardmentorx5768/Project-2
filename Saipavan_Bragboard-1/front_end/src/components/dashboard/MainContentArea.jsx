import React from 'react';

function MainContentArea() {
  return (
    <main className="main-content">
      {/* Welcome Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Welcome back, User 👋</h2>
        <p className="text-slate-500">Here's what's happening in your team today.</p>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-sm text-slate-500">Shout-outs Sent</p>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Received</p>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Reactions Given</p>
          <p className="text-2xl font-bold">45</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Comments</p>
          <p className="text-2xl font-bold">21</p>
        </div>
      </div>
      
      {/* Main Feed */}
      <div className="shoutout-card">
        <p>The main shout-out feed will go here.</p>
      </div>
    </main>
  );
}

export default MainContentArea;