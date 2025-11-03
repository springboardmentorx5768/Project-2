import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
// We assume your styles are in Dashboard.css or a dedicated Sidebar.css
// Ensure .sidebar-nav, .sidebar-link, .active, .sidebar-icon are defined
import '../../styles/Sidebar.css'; 

function SidebarNavigation() {
  const navigate = useNavigate();
  const handleCreate = () => {
    // Navigate to the dedicated create page
    navigate('/create-shoutout');
  };

  return (
    <aside className="sidebar">
      <h1 className="sidebar-header">BragBoard</h1>

      <button className="create-shoutout-btn" onClick={handleCreate}>
        + Create Post
      </button>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          Feed
        </NavLink>
        <NavLink to="/my-shoutouts" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          My Posts
        </NavLink>
        <NavLink to="/department-feed" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg>
          Department
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" /></svg>
          Rankings
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `nav-link bottom-section ${isActive ? 'active' : ''}`}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Profile
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Settings
        </NavLink>
        {/* Logout placed under Settings so it's anchored at the bottom area */}
        <LogoutButton />
      </nav>
    </aside>
  );
}

// Small logout button component placed here to keep sidebar self-contained
function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
    } catch (e) {
      localStorage.removeItem('token');
    }
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="nav-link" title="Logout">
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8" /></svg>
      Logout
    </button>
  );
}

export default SidebarNavigation;