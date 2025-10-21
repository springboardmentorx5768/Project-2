import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateShoutoutModal from '../components/shoutout/CreateShoutoutModal.jsx';
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx';

function CreateShoutoutPage() {
  const navigate = useNavigate();

  const handleShoutoutCreated = () => {
    // After creation navigate back to dashboard (and ideally refresh feed)
    navigate('/dashboard');
  };

  return (
    <DashboardLayout onShoutoutCreated={handleShoutoutCreated}>
      {/* Pass the inline prop so the form renders centered in main area as a card */}
      <CreateShoutoutModal inline onSubmit={async (data) => {
        try {
          const api = await import('../api/apiService.js');
          await api.createShoutout(data);
          handleShoutoutCreated();
        } catch (e) {
          console.error('Failed to create shoutout', e);
          alert('Failed to post shoutout');
        }
      }} />
    </DashboardLayout>
  );
}

export default CreateShoutoutPage;
