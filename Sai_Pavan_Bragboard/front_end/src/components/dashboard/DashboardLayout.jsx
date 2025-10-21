import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNavigation from './SidebarNavigation.jsx';
import TopNavbar from './TopNavbar.jsx';
import MainContentArea from './MainContentArea.jsx';
import CreateShoutoutModal from '../shoutout/CreateShoutoutModal.jsx';
import { createShoutout } from '../../api/apiService.js';
import '../../styles/Dashboard.css';

function DashboardLayout({ children, onShoutoutCreated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateShoutout = async (shoutoutData) => {
    try {
      await createShoutout(shoutoutData);
      setIsModalOpen(false); // Close modal
      onShoutoutCreated(); // Refresh the feed
    } catch (err) {
      alert("Failed to post shout-out.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <SidebarNavigation onOpenModal={() => { navigate('/dashboard'); setIsModalOpen(true); }} />
        <TopNavbar />
        {/* We render the main-slot which contains the current page (children) and the modal when open */}
        <div className="main-slot">
          {children}
          {isModalOpen && (
            <CreateShoutoutModal 
              onClose={() => setIsModalOpen(false)} 
              onSubmit={handleCreateShoutout} 
            />
          )}
        </div>
      </div>
      
    </div>
  );
}

export default DashboardLayout;