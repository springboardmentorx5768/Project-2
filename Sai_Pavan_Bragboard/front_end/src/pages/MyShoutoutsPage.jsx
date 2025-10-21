import React, { useState, useEffect } from 'react';
import { getMyShoutouts, deleteShoutout } from '../api/apiService.js';
import ShoutoutCard from '../components/shoutout/ShoutoutCard.jsx';

function MyShoutoutsPage() {
  const [shoutouts, setShoutouts] = useState([]);
  useEffect(() => {
    getMyShoutouts().then(setShoutouts).catch(console.error);
  }, []);

  const refresh = () => getMyShoutouts().then(setShoutouts).catch(console.error);

  const handleDelete = async (id) => {
    if (!confirm('Delete this shoutout? This action cannot be undone.')) return;
    try {
      await deleteShoutout(id);
      refresh();
    } catch (err) {
      console.error('delete error', err);
      alert(err?.message || 'Could not delete shoutout');
    }
  };

  

  return (
    <main className="main-content">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">My Shoutouts</h2>
      <div className="space-y-6">
        {shoutouts.length > 0 ? (
          shoutouts.map((item) => (
            <div key={item.id} style={{ paddingTop: 8 }}>
              <ShoutoutCard shoutout={item} onUpdate={refresh} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => handleDelete(item.id)} className="delete-btn">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="shoutout-card"><p>You haven't sent any shoutouts yet.</p></div>
        )}
      </div>
    </main>
  );
}
export default MyShoutoutsPage;