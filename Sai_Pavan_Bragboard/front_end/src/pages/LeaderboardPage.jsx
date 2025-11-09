import React, { useEffect, useState } from 'react';
import { fetchLeaderboard, fetchCurrentEmployeesOfMonth, fetchDepartments } from '../api/apiService.js';

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [days, setDays] = useState(undefined); // undefined = All time
  const [eomIds, setEomIds] = useState(new Set());
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchLeaderboard({ days, department: department || undefined });
        setEntries(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days, department]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchCurrentEmployeesOfMonth();
        const ids = new Set(rows.map(r => r.user_id).filter(id => typeof id === 'number'));
        setEomIds(ids);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchDepartments();
        setDepartments(Array.isArray(list) ? list : []);
      } catch {}
    })();
  }, []);

  return (
    <div className="fade-in">
      <div className="content-header">
        <div className="header-content">
          <h1>Rankings</h1>
          <p className="subtitle">Top contributors by points (live scoring)</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-value">{entries.length}</div>
            <div className="stat-label">Listed</div>
          </div>
          <div className="stat-card filter-card">
            <div className="filter-inner">
              <label htmlFor="lb-range" className="filter-label">Time Range</label>
              <select
                id="lb-range"
                className="form-input filter-select"
                value={days ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setDays(v === '' ? undefined : Number(v));
                }}
              >
                <option value="">All Time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
          <div className="stat-card filter-card">
            <div className="filter-inner">
              <label htmlFor="lb-dept" className="filter-label">Department</label>
              <select
                id="lb-dept"
                className="form-input filter-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shoutout-skeleton" style={{ height: '52px' }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card" role="alert" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
          <strong style={{ color: '#b91c1c' }}>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No rankings yet</h3>
          <p>Start sharing appreciation to see the leaderboard fill up.</p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="card leaderboard-card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>Leaderboard</h2>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 1rem 0.5rem' }}>
            Showing top {entries.length} contributors{days ? ` (last ${days} days)` : ' (all time)'}{department ? ` in ${department}` : ''}.
          </div>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Name</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => {
                  const points = typeof e?.score === 'number' ? e.score : ((e?.sent ?? 0) + (e?.received ?? 0));
                  const rank = e?.rank ?? idx + 1;
                  return (
                    <tr key={`${e?.name || 'user'}-${rank}`} className="leaderboard-row">
                      <td>
                        <span className={`rank-badge ${rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : ''}`}>{rank}</span>
                      </td>
                      <td className="leaderboard-name">
                        {e?.name || '—'}
                        {typeof e?.user_id === 'number' && eomIds.has(e.user_id) && (
                          <span className="eom-badge" title="Employee of the Month – Outstanding contributor">★</span>
                        )}
                      </td>
                      <td><strong>{points}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
