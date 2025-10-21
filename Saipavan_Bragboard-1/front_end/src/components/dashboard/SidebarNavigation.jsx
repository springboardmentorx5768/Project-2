import React from 'react';

function SidebarNavigation() {
  return (
    <aside className="sidebar-nav">
      <h1 className="text-2xl font-bold text-violet-600 mb-8">BragBoard</h1>
      <nav>
        <ul>
          <li><a href="#" className="flex items-center p-3 font-semibold text-violet-600 bg-violet-100 rounded-lg">Feed</a></li>
          <li><a href="#" className="flex items-center p-3 text-slate-600 hover:bg-slate-100 rounded-lg">My Shout-outs</a></li>
          <li><a href="#" className="flex items-center p-3 text-slate-600 hover:bg-slate-100 rounded-lg">Leaderboard</a></li>
          <li><a href="#" className="flex items-center p-3 text-slate-600 hover:bg-slate-100 rounded-lg">Profile</a></li>
        </ul>
      </nav>
    </aside>
  );
}

export default SidebarNavigation;