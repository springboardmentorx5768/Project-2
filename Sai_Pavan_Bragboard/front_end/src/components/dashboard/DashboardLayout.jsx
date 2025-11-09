import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNavigation from './SidebarNavigation.jsx';
import TopNavbar from './TopNavbar.jsx';
import MainContentArea from './MainContentArea.jsx';
import '../../styles/Dashboard.css';

function DashboardLayout({ children, onShoutoutCreated }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <SidebarNavigation />
        <TopNavbar />
        {/* We render the main-slot which contains the current page (children) */}
        <div className="main-slot">
          {children}
        </div>
      </div>
      
    </div>
  );
}

export default DashboardLayout;