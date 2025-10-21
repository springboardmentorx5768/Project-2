import React, { useState, useEffect } from 'react';
import { getShoutouts } from '../../api/apiService.js';
import ShoutoutCard from '../shoutout/ShoutoutCard.jsx';

function MainContentArea() {
  const [shoutouts, setShoutouts] = useState([]);
  const [stats, setStats] = useState({ sent: 0, received: 0, reactions: 0, comments: 0 });

  const fetchShoutouts = async () => {
    try {
      const data = await getShoutouts();
      setShoutouts(data);
    } catch (err) {
      // keep console logging for debugging, don't render placeholder UI
      console.error('Failed fetching shoutouts:', err);
    }
  };

  useEffect(() => {
    fetchShoutouts();
    // We will fetch stats and leaderboard data here later
  }, []);

  const handleCreateShoutout = async (shoutoutData) => {
    // Create behavior is handled by DashboardLayout's modal; keep placeholder for future wiring.
    console.log('Submitting shoutout (placeholder):', shoutoutData);
  };

  return (
    <main className="main-content">
      <div className="space-y-6">
        {shoutouts.length > 0 && shoutouts.map((item) => (
          <ShoutoutCard key={item.id} shoutout={item} onUpdate={fetchShoutouts} />
        ))}
      </div>
    </main>
  );
}

export default MainContentArea;