import React from 'react';
import SidebarNavigation from './SidebarNavigation.jsx';
import TopNavbar from './TopNavbar.jsx';
import MainContentArea from './MainContentArea.jsx';
import '../../styles/DashboardLayout.css';

function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <SidebarNavigation />
        <TopNavbar />
        <MainContentArea />
      </div>
    </div>
  );
}

export default DashboardLayout;