import React, { useState, useEffect } from 'react';
import { getShoutoutsByDepartment, getCurrentUserProfile } from '../api/apiService.js';
import ShoutoutCard from '../components/shoutout/ShoutoutCard.jsx';

function DepartmentFeedPage() {
  const [shoutouts, setShoutouts] = useState([]);
  const [department, setDepartment] = useState('');

  const fetchDeptFeed = async () => {
    try {
      const user = await getCurrentUserProfile();
      setDepartment(user.department);
      if (user.department) {
        const data = await getShoutoutsByDepartment(user.department);
        setShoutouts(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDeptFeed();
  }, []);

  return (
    <main className="main-content">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Feed for {department || 'Your'} Department</h2>
      <div className="space-y-6">
        {shoutouts.length > 0 ? (
          shoutouts.map((item) => (
            <ShoutoutCard key={item.id} shoutout={item} onUpdate={fetchDeptFeed} />
          ))
        ) : (
          <div className="shoutout-card"><p>No shout-outs found for your department.</p></div>
        )}
      </div>
    </main>
  );
}
export default DepartmentFeedPage;