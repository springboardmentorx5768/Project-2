import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '../api/apiService.js';

function initials(name) {
  if (!name) return 'U';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

export default function UserPublicProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError('');
        const data = await getUserById(id);
        setUser(data);
      } catch (e) {
        setError(e.message || 'Failed to load user');
      } finally { setLoading(false); }
    })();
  }, [id]);

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="header-content">
          <h1>User Profile</h1>
          <p className="subtitle">Public profile</p>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="shoutout-skeleton" style={{ height: '120px' }} />
        </div>
      )}
      {!loading && error && (
        <div className="card" style={{ background:'#fef2f2', borderColor:'#fecaca' }}>
          {error}
        </div>
      )}
      {!loading && !error && user && (
        <div className="card profile-card">
          <div className="card-header">
            <div className="avatar" aria-hidden>{initials(user.full_name || user.email)}</div>
            <div className="sender-info">
              <h3 className="sender-name">{user.full_name || user.email}</h3>
              {user.department && <p className="sender-department">{user.department}</p>}
              {user.created_at && (
                <p className="timestamp">Member since {new Date(user.created_at).toLocaleDateString(undefined,{year:'numeric',month:'long'})}</p>
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Email</div>
                <div className="info-value">{user.email}</div>
              </div>
              {user.location && (
                <div className="info-item">
                  <div className="info-label">Location</div>
                  <div className="info-value">{user.location}</div>
                </div>
              )}
              {user.bio && (
                <div className="info-item info-item-full">
                  <div className="info-label">About</div>
                  <div className="info-value">{user.bio}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
