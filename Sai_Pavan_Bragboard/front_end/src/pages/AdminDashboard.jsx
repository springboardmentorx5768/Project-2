import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getShoutouts, getShoutout, fetchAdminInsights, fetchLeaderboard, adminDeleteShoutout, exportReportsCsv, getUsers, promoteUserToAdmin, demoteUserFromAdmin, adminDeleteUser, fetchReports, resolveReport, setEmployeeOfMonth, fetchCurrentEmployeesOfMonth, fetchDepartments, fetchPendingUsers, approveUser, fetchDepartmentAdmins, assignDepartmentAdmin, revokeDepartmentAdmin } from '../api/apiService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { MAIN_ADMIN_EMAIL } from '../config.js';

function AdminDashboard() {
  const [shoutouts, setShoutouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState({
    totalShoutouts: 0,
    totalUsers: 0,
    totalReactions: 0,
    totalComments: 0,
    activeUsers: 0,
    recentActivity: [],
    topTagged: []
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportsFilter, setReportsFilter] = useState('open');
  const [openPanel, setOpenPanel] = useState(null); // adds 'recognition'
  const [eomForm, setEomForm] = useState({ user_id: '', department: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), note: '' });
  const [departments, setDepartments] = useState([]);
  const [eomSubmitting, setEomSubmitting] = useState(false);
  const [eomError, setEomError] = useState('');
  const [currentEom, setCurrentEom] = useState([]);
  // Approvals
  const [pendingUsers, setPendingUsers] = useState([]);
  const [departmentAdmins, setDepartmentAdmins] = useState([]);
  const [deptAdminForm, setDeptAdminForm] = useState({ user_id: '', department: '' });
  // Manage Admins filters
  const [adminFilter, setAdminFilter] = useState({ query: '', role: 'all', department: '' });
  // Report moderation preview state
  const [previewShoutouts, setPreviewShoutouts] = useState({}); // shoutout_id -> data or { error }
  const [activePreviewId, setActivePreviewId] = useState(null); // for inline expanded preview
  const [modalShoutout, setModalShoutout] = useState(null); // full modal display
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const data = await getShoutouts();
        setShoutouts(data);
        // Server insights
        try {
          const insights = await fetchAdminInsights();
          // insights: { total_posts, total_users, top_tagged_users }
          setAdminStats(prev => ({
            ...prev,
            totalShoutouts: insights.total_posts,
            totalUsers: insights.total_users,
            topTagged: insights.top_tagged_users || [],
          }));
        } catch {}
        // Current employees of month
        try {
          const eom = await fetchCurrentEmployeesOfMonth();
          setCurrentEom(eom || []);
        } catch {}
        try {
          const lb = await fetchLeaderboard();
          setLeaderboard(lb || []);
        } catch {}
        // Load reports for admins
        try {
          const rep = await fetchReports('open');
          setReports(rep || []);
          setReportsFilter('open');
        } catch {}
        // Load users for recognition form (needed for any admin)
        try {
          const all = await getUsers();
          setUsers(all || []);
        } catch {}
        // Pending users for approval
        try {
          const pend = await fetchPendingUsers();
          setPendingUsers(Array.isArray(pend) ? pend : []);
        } catch {}
        // Department admins list
        try {
          const da = await fetchDepartmentAdmins();
          setDepartmentAdmins(Array.isArray(da) ? da : []);
        } catch {}
        
        // Calculate admin statistics
        const totalReactions = data.reduce((acc, shoutout) => 
          acc + (shoutout.reactions?.length || 0), 0);
        const totalComments = data.reduce((acc, shoutout) => 
          acc + (shoutout.comments?.length || 0), 0);
        
        // Get unique users (this is a simplified version)
        const uniqueUsers = new Set();
        data.forEach(shoutout => {
          if (shoutout.sender?.email) uniqueUsers.add(shoutout.sender.email);
        });
        
        setAdminStats(prev => ({
          ...prev,
          totalShoutouts: data.length,
          totalUsers: uniqueUsers.size,
          totalReactions,
          totalComments,
          activeUsers: uniqueUsers.size, // Simplified - should be users active in last 30 days
          recentActivity: data.slice(0, 5) // Last 5 activities
        }));
      } catch (err) {
        console.error('Failed fetching admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
    // Load departments once
    (async () => {
      try {
        const list = await fetchDepartments();
        setDepartments(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn('Failed to load departments for EoM form', e);
      }
    })();
  }, []);

  const isAdmin = !!(user && (user.is_superuser || user.email === MAIN_ADMIN_EMAIL));

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="loading-state">
          <h2>Loading Admin Dashboard...</h2>
        </div>
      </main>
    );
  }

  const handleDeleteShoutout = async (id) => {
    if (!window.confirm('Delete this shout-out?')) return;
    try {
      await adminDeleteShoutout(id);
      setShoutouts(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert(e.message || 'Failed to delete');
    }
  };

  const reloadReports = async (status) => {
    try {
      const rep = await fetchReports(status);
      setReports(rep || []);
    } catch (e) {
      console.error('Failed to fetch reports', e);
    }
  };

  const handleResolveReport = async (rid) => {
    try {
      await resolveReport(rid);
      // Remove from current list optimistically
      setReports(prev => prev.filter(r => r.id !== rid));
    } catch (e) {
      alert(e.message || 'Failed to resolve report');
    }
  };

  const isMainAdmin = user && user.email === MAIN_ADMIN_EMAIL;
  const handlePromote = async (uid) => {
    try {
      await promoteUserToAdmin(uid);
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, is_superuser: true } : u));
    } catch (e) { alert(e.message || 'Failed to promote'); }
  };
  const handleDemote = async (uid) => {
    try {
      await demoteUserFromAdmin(uid);
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, is_superuser: false } : u));
    } catch (e) { alert(e.message || 'Failed to demote'); }
  };

  return (
    <main className="main-content">
      <div className="content-header admin-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage and monitor your team's recognition activities</p>
        </div>
        <div className="admin-header-actions">
            <Link to="/create-shoutout" className="create-shoutout-link" aria-label="Create a new shout-out">
              <span className="chip-icon" aria-hidden="true">➕</span>
              <span>Create Shout-Out</span>
            </Link>
        </div>
      </div>

      {/* Compact Stats Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card"><div className="stat-icon">📊</div><div className="stat-content"><div className="stat-value">{adminStats.totalShoutouts}</div><div className="stat-label">Total Shout-outs</div></div></div>
        <div className="admin-stat-card"><div className="stat-icon">👥</div><div className="stat-content"><div className="stat-value">{adminStats.totalUsers}</div><div className="stat-label">Active Users</div></div></div>
        <div className="admin-stat-card"><div className="stat-icon">❤️</div><div className="stat-content"><div className="stat-value">{adminStats.totalReactions}</div><div className="stat-label">Reactions</div></div></div>
        <div className="admin-stat-card"><div className="stat-icon">💬</div><div className="stat-content"><div className="stat-value">{adminStats.totalComments}</div><div className="stat-label">Comments</div></div></div>
      </div>

      {/* Action Bar (no scrolling) */}
      <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
        <button className="action-button" aria-expanded={openPanel==='insights'} onClick={() => setOpenPanel(prev => prev==='insights'?null:'insights')}><span className="action-icon">🕒</span>Recent Activity</button>
        <button className="action-button" aria-expanded={openPanel==='leaderboard'} onClick={() => setOpenPanel(prev => prev==='leaderboard'?null:'leaderboard')}><span className="action-icon">🏆</span>Top Contributors</button>
        <button className="action-button" aria-expanded={openPanel==='mostTagged'} onClick={() => setOpenPanel(prev => prev==='mostTagged'?null:'mostTagged')}><span className="action-icon">🏷️</span>Most Tagged</button>
        <button className="action-button" aria-expanded={openPanel==='moderate'} onClick={() => setOpenPanel(prev => prev==='moderate'?null:'moderate')}><span className="action-icon">🛡️</span>Moderate Shout-outs</button>
  <button className="action-button" aria-expanded={openPanel==='reports'} onClick={() => setOpenPanel(prev => prev==='reports'?null:'reports')}><span className="action-icon">🚩</span>Reports</button>
  <button className="action-button" aria-expanded={openPanel==='recognition'} onClick={() => setOpenPanel(prev => prev==='recognition'?null:'recognition')} disabled={!isAdmin} title={!isAdmin ? 'Admin access required' : undefined}><span className="action-icon">🌟</span>Employee of Month</button>
        {isMainAdmin && (
          <button className="action-button" aria-expanded={openPanel==='admins'} onClick={() => setOpenPanel(prev => prev==='admins'?null:'admins')}><span className="action-icon">🔑</span>Manage Admins</button>
        )}
        {isAdmin && (
          <button className="action-button" aria-expanded={openPanel==='approvals'} onClick={() => setOpenPanel(prev => prev==='approvals'?null:'approvals')}>
            <span className="action-icon">✅</span>Pending Approvals {pendingUsers.length ? `(${pendingUsers.length})` : ''}
          </button>
        )}
        {isMainAdmin && (
          <button className="action-button" aria-expanded={openPanel==='deptAdmins'} onClick={() => setOpenPanel(prev => prev==='deptAdmins'?null:'deptAdmins')}>
            <span className="action-icon">🏢</span>Dept Admins
          </button>
        )}
        <button className="action-button" onClick={exportReportsCsv}><span className="action-icon">⬇️</span>Export CSV</button>
      </div>

      {/* Inline Panel below action bar */}
      {openPanel && (
        <div className="admin-panel" style={{ marginTop: '0.75rem' }}>
          {openPanel === 'insights' && (
            <>
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {adminStats.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-avatar">{(activity.sender?.full_name || activity.sender?.email || 'U').charAt(0).toUpperCase()}</div>
                    <div className="activity-details">
                      <div className="activity-user">{activity.sender?.full_name || activity.sender?.email || 'Unknown User'}</div>
                      <div className="activity-action">Created a new shout-out</div>
                      <div className="activity-time">{activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recently'}</div>
                    </div>
                  </div>
                ))}
                {adminStats.recentActivity.length === 0 && <div className="no-activity">No recent activity</div>}
              </div>
            </>
          )}

          {openPanel === 'leaderboard' && (
            <>
              <h3>Top Contributors</h3>
              <div className="activity-list">
                {leaderboard.map(entry => {
                  const points = typeof entry.score === 'number' ? entry.score : ((entry.sent ?? 0) + (entry.received ?? 0));
                  return (
                    <div key={entry.rank} className="activity-item">
                      <div className="activity-avatar">{entry.name?.charAt(0) || 'U'}</div>
                      <div className="activity-details">
                        <div className="activity-user">{entry.name}</div>
                        <div className="activity-action">Points {points}</div>
                      </div>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && <div className="no-activity">No leaderboard data</div>}
              </div>
            </>
          )}

          {openPanel === 'mostTagged' && (
            <>
              <h3>Most Tagged</h3>
              <ul style={{ margin: 0, padding: '0 1rem' }}>
                {(adminStats.topTagged || []).map((name, idx) => (<li key={idx}>{name}</li>))}
                {(adminStats.topTagged || []).length === 0 && <li>No data</li>}
              </ul>
            </>
          )}

          {openPanel === 'reports' && (
            <>
              <h3>Reports</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <select
                  value={reportsFilter}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setReportsFilter(val);
                    await reloadReports(val === 'all' ? undefined : val);
                  }}
                  className="form-input"
                  style={{ maxWidth: '220px' }}
                >
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                  <option value="all">All</option>
                </select>
                <button className="action-button" onClick={() => reloadReports(reportsFilter === 'all' ? undefined : reportsFilter)}>Refresh</button>
              </div>
              <div className="activity-list">
                {reports.map(r => (
                  <div key={r.id} className="activity-item">
                    <div className="activity-avatar">R</div>
                    <div className="activity-details" style={{ flex: 1 }}>
                      <div className="activity-user">Report #{r.id} · {r.status?.toUpperCase()}</div>
                      <div className="activity-action">Reason: {r.reason || 'n/a'} · Shoutout ID: {r.shoutout_id} · Reporter ID: {r.reporter_id}</div>
                      {r.created_at && (<div className="activity-time">{new Date(r.created_at).toLocaleString()}</div>)}
                    </div>
                    {r.status !== 'resolved' && (<button className="action-button" onClick={() => handleResolveReport(r.id)}>Resolve</button>)}
                  </div>
                ))}
                {reports.length === 0 && <div className="no-activity">No reports found</div>}
              </div>
            </>
          )}

          {openPanel === 'admins' && isMainAdmin && (
            <>
              <h3>Manage Admins</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <input
                  className="form-input"
                  placeholder="Search name or email"
                  value={adminFilter.query}
                  onChange={(e)=>setAdminFilter(f=>({ ...f, query: e.target.value }))}
                />
                <select
                  className="form-input"
                  value={adminFilter.role}
                  onChange={(e)=>setAdminFilter(f=>({ ...f, role: e.target.value }))}
                >
                  <option value="all">All users</option>
                  <option value="admins">Admins only</option>
                  <option value="non-admins">Non-admins only</option>
                </select>
                <select
                  className="form-input"
                  value={adminFilter.department}
                  onChange={(e)=>setAdminFilter(f=>({ ...f, department: e.target.value }))}
                >
                  <option value="">All departments</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              {(() => {
                const q = adminFilter.query.trim().toLowerCase();
                const filteredUsers = (users || []).filter(u => {
                  const matchText = !q || ((u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
                  const matchRole = adminFilter.role === 'all' || (adminFilter.role === 'admins' ? u.is_superuser : !u.is_superuser);
                  const matchDept = !adminFilter.department || (u.department === adminFilter.department);
                  return matchText && matchRole && matchDept;
                });
                return (
                  <>
                    <div style={{ fontSize:12, color:'#64748b', marginBottom:'0.25rem' }}>{filteredUsers.length} result(s)</div>
                    <div className="activity-list">
                      {filteredUsers.map(u => (
                        <div key={u.id} className="activity-item">
                          <div className="activity-avatar">{(u.full_name || u.email || 'U').charAt(0).toUpperCase()}</div>
                          <div className="activity-details" style={{ flex: 1 }}>
                            <div className="activity-user">{u.full_name || u.email}</div>
                            <div className="activity-action">{u.email} {u.is_superuser ? '(Admin)' : ''} {u.department ? `· ${u.department}` : ''}</div>
                          </div>
                          {u.email !== MAIN_ADMIN_EMAIL && (
                            <div style={{ display:'flex', gap:'0.4rem' }}>
                              {u.is_superuser ? (
                                <button className="action-button" onClick={() => handleDemote(u.id)} title="Demote">Demote</button>
                              ) : (
                                <button className="action-button" onClick={() => handlePromote(u.id)} title="Promote">Promote</button>
                              )}
                              <button
                                className="action-button"
                                title="Delete User"
                                onClick={async () => {
                                  if (!window.confirm(`Permanently delete user ${u.email}? This will remove their data and cannot be undone.`)) return;
                                  try {
                                    await adminDeleteUser(u.id);
                                    setUsers(prev => prev.filter(x => x.id !== u.id));
                                  } catch (e) {
                                    alert(e.message || 'Failed to delete user');
                                  }
                                }}
                                style={{ background:'#fee2e2', color:'#b91c1c' }}
                              >🗑️</button>
                            </div>
                          )}
                        </div>
                      ))}
                      {filteredUsers.length === 0 && <div className="no-activity">No users match filters</div>}
                    </div>
                  </>
                );
              })()}
            </>
          )}

          {openPanel === 'deptAdmins' && isMainAdmin && (
            <>
              <h3>Department Admins</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!deptAdminForm.user_id || !deptAdminForm.department) { alert('Select user and department'); return; }
                  try {
                    await assignDepartmentAdmin(Number(deptAdminForm.user_id), deptAdminForm.department);
                    const da = await fetchDepartmentAdmins();
                    setDepartmentAdmins(da || []);
                    alert('Assigned department admin');
                    setDeptAdminForm({ user_id: '', department: '' });
                  } catch (err) {
                    alert(err.message || 'Failed to assign');
                  }
                }}
                style={{ marginBottom:'1rem', display:'grid', gap:'0.5rem', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))' }}
              >
                <select className="form-input" value={deptAdminForm.user_id} onChange={(e)=>setDeptAdminForm(f=>({...f,user_id:e.target.value}))}>
                  <option value="">Select user</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                </select>
                <select className="form-input" value={deptAdminForm.department} onChange={(e)=>setDeptAdminForm(f=>({...f,department:e.target.value}))}>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button type="submit" className="action-button">Assign</button>
              </form>
              <div className="activity-list">
                {departmentAdmins.map(r => (
                  <div key={r.id} className="activity-item">
                    <div className="activity-avatar">{r.department.charAt(0).toUpperCase()}</div>
                    <div className="activity-details" style={{ flex:1 }}>
                      <div className="activity-user">User #{r.user_id}</div>
                      <div className="activity-action">Dept: {r.department}</div>
                    </div>
                    <button
                      className="action-button"
                      title="Revoke"
                      onClick={async () => {
                        if(!window.confirm('Revoke this department admin role?')) return;
                        try {
                          await revokeDepartmentAdmin(r.user_id, r.department);
                          setDepartmentAdmins(prev => prev.filter(x => x.id !== r.id));
                        } catch(e) { alert(e.message || 'Failed to revoke'); }
                      }}
                      style={{ background:'#fee2e2', color:'#b91c1c' }}
                    >Revoke</button>
                  </div>
                ))}
                {departmentAdmins.length === 0 && <div className="no-activity">No department admins</div>}
              </div>
            </>
          )}

          {openPanel === 'approvals' && isAdmin && (
            <>
              <h3>Pending User Approvals</h3>
              <div className="activity-list">
                {pendingUsers.map(u => (
                  <div key={u.id} className="activity-item">
                    <div className="activity-avatar">{(u.full_name || u.email || 'U').charAt(0).toUpperCase()}</div>
                    <div className="activity-details" style={{ flex: 1 }}>
                      <div className="activity-user">{u.full_name || u.email}</div>
                      <div className="activity-action">{u.email} · {u.department || 'No department'} · {u.is_approved ? 'Approved' : 'Pending'}</div>
                    </div>
                    {!u.is_approved && (
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <button
                          className="action-button"
                          onClick={async () => {
                            try {
                              await approveUser(u.id);
                              setPendingUsers(prev => prev.filter(x => x.id !== u.id));
                              setUsers(prev => [...prev, { ...u, is_approved: true }]);
                              alert(`Approved ${u.email}`);
                            } catch (e) { alert(e.message || 'Failed to approve'); }
                          }}
                        >Approve</button>
                        <button
                          className="action-button"
                          style={{ background:'#fee2e2', color:'#b91c1c' }}
                          title="Delete User"
                          onClick={async () => {
                            if (!window.confirm(`Delete pending user ${u.email}? This cannot be undone.`)) return;
                            try {
                              await adminDeleteUser(u.id);
                              setPendingUsers(prev => prev.filter(x => x.id !== u.id));
                            } catch (e) { alert(e.message || 'Failed to delete user'); }
                          }}
                        >🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
                {pendingUsers.length === 0 && <div className="no-activity">No pending users</div>}
              </div>
            </>
          )}

          {openPanel === 'moderate' && (
            <>
              <h3>All Shout-outs (Moderate)</h3>
              <div className="activity-list">
                {shoutouts.map(s => (
                  <div key={s.id} className="activity-item">
                    <div className="activity-avatar">{(s.sender?.full_name || s.sender?.email || 'U').charAt(0).toUpperCase()}</div>
                    <div className="activity-details" style={{ flex: 1 }}>
                      <div className="activity-user">{s.sender?.full_name || s.sender?.email}</div>
                      <div className="activity-action">{s.message}</div>
                    </div>
                    <button className="action-button" onClick={() => handleDeleteShoutout(s.id)} title="Delete">🗑️</button>
                  </div>
                ))}
                {shoutouts.length === 0 && <div className="no-activity">No shout-outs available</div>}
              </div>
            </>
          )}

          {openPanel === 'recognition' && (
            <>
              <h3>Employee of the Month</h3>
              {!isAdmin && (
                <div className="card" style={{ background:'#fff7ed', borderColor:'#fed7aa', marginBottom:'0.75rem' }}>
                  Admin access required to set Employee of the Month.
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!eomForm.user_id) { alert('Select a user'); return; }
                  setEomError('');
                  setEomSubmitting(true);
                  try {
                    const payload = {
                      user_id: Number(eomForm.user_id),
                      department: eomForm.department || null,
                      month: Number(eomForm.month),
                      year: Number(eomForm.year),
                      note: eomForm.note || null,
                    };
                    await setEmployeeOfMonth(payload);
                    const refreshed = await fetchCurrentEmployeesOfMonth();
                    setCurrentEom(refreshed || []);
                    alert('Employee of the month saved');
                  } catch (err) {
                    setEomError(err.message || 'Failed to save');
                  } finally {
                    setEomSubmitting(false);
                  }
                }}
                className="space-y-4"
                style={{ marginBottom: '1.5rem' }}
              >
                <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
                  <div>
                    <label className="form-label">User</label>
                    <select
                      className="form-input"
                      value={eomForm.user_id}
                      onChange={(e) => setEomForm(f => ({ ...f, user_id: e.target.value }))}
                      required
                      disabled={!isAdmin}
                    >
                      <option value="">Select user</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Department (optional)</label>
                    <select
                      className="form-input"
                      value={eomForm.department}
                      onChange={(e) => setEomForm(f => ({ ...f, department: e.target.value }))}
                      disabled={!isAdmin}
                    >
                      <option value="">(None / Company-wide)</option>
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Month</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      className="form-input"
                      value={eomForm.month}
                      onChange={(e) => setEomForm(f => ({ ...f, month: e.target.value }))}
                      required
                      disabled={!isAdmin}
                    />
                  </div>
                  <div>
                    <label className="form-label">Year</label>
                    <input
                      type="number"
                      min={2000}
                      max={3000}
                      className="form-input"
                      value={eomForm.year}
                      onChange={(e) => setEomForm(f => ({ ...f, year: e.target.value }))}
                      required
                      disabled={!isAdmin}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Note (optional)</label>
                    <input
                      className="form-input"
                      value={eomForm.note}
                      onChange={(e) => setEomForm(f => ({ ...f, note: e.target.value }))}
                      disabled={!isAdmin}
                      placeholder="Recognition note"
                    />
                  </div>
                </div>
                <button type="submit" className="button" disabled={!isAdmin || eomSubmitting}>{eomSubmitting ? 'Saving...' : 'Save Employee of Month'}</button>
              </form>
              {eomError && (
                <div className="card" role="alert" style={{ background:'#fef2f2', borderColor:'#fecaca', marginTop:'-1rem', marginBottom:'1rem' }}>
                  <strong style={{ color:'#b91c1c' }}>Error:</strong> {eomError}
                </div>
              )}
              <div>
                <h4 style={{ margin: '0 0 0.75rem 0' }}>Current Month</h4>
                <div className="activity-list">
                  {currentEom.map(r => (
                    <div key={r.id} className="activity-item">
                      <div className="activity-avatar">{(r.user_name || 'U').charAt(0)}</div>
                      <div className="activity-details" style={{ flex: 1 }}>
                        <div className="activity-user">
                          {r.user_name || 'Unknown'} {r.department ? `· ${r.department}` : ''}
                          <span className="eom-badge" title="Employee of the Month">★</span>
                        </div>
                        <div className="activity-action">Month {r.month}/{r.year}</div>
                        {r.note && <div className="activity-time" style={{ color: '#7c3aed' }}>{r.note}</div>}
                      </div>
                    </div>
                  ))}
                  {currentEom.length === 0 && <div className="no-activity">No employees of month set yet</div>}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* Full shoutout modal */}
      {(modalShoutout || modalLoading || modalError) && (
        <div className="modal-overlay" onClick={() => { setModalShoutout(null); setModalError(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth:'640px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
              <h3 style={{ margin:0 }}>Shoutout Detail</h3>
              <button className="button button-outline" onClick={() => { setModalShoutout(null); setModalError(''); }}>✕</button>
            </div>
            {modalLoading && <div>Loading...</div>}
            {modalError && <div style={{ color:'#b91c1c' }}>Error: {modalError}</div>}
            {modalShoutout && !modalLoading && !modalError && (
              <div>
                <div style={{ marginBottom:'0.75rem' }}>
                  <strong>{modalShoutout.sender?.full_name || modalShoutout.sender?.email || 'Unknown'}:</strong>
                  <div style={{ whiteSpace:'pre-wrap', marginTop:'0.5rem' }}>{modalShoutout.message}</div>
                </div>
                {Array.isArray(modalShoutout.attachments) && modalShoutout.attachments.length > 0 && (
                  <div style={{ marginBottom:'0.75rem' }}>
                    <h4 style={{ margin:'0 0 0.5rem 0' }}>Attachments</h4>
                    <ul style={{ paddingLeft:'1.25rem', margin:0 }}>
                      {modalShoutout.attachments.map(a => (
                        <li key={a.id}>{a.filename} ({a.file_type})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(modalShoutout.comments) && modalShoutout.comments.length > 0 && (
                  <div style={{ marginBottom:'0.75rem' }}>
                    <h4 style={{ margin:'0 0 0.5rem 0' }}>Comments</h4>
                    <ul style={{ paddingLeft:'1.25rem', margin:0 }}>
                      {modalShoutout.comments.slice(0,6).map(c => (
                        <li key={c.id}><strong>{c.user?.full_name || c.user?.email || 'User'}:</strong> {c.content}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  <button
                    className="action-button"
                    onClick={() => {
                      setModalShoutout(null); setModalError('');
                    }}
                  >Close</button>
                  <button
                    className="action-button"
                    onClick={async () => {
                      try {
                        await resolveReport(reports.find(r => r.shoutout_id === modalShoutout.id)?.id);
                        setReports(prev => prev.filter(r => r.shoutout_id !== modalShoutout.id));
                        setModalShoutout(null);
                      } catch (e) { alert(e.message || 'Failed to resolve'); }
                    }}
                  >Resolve Report</button>
                  <button
                    className="action-button"
                    style={{ background:'#fee2e2', color:'#b91c1c' }}
                    onClick={async () => {
                      if (!window.confirm('Delete this shoutout? This cannot be undone.')) return;
                      try {
                        await adminDeleteShoutout(modalShoutout.id);
                        setReports(prev => prev.filter(r => r.shoutout_id !== modalShoutout.id));
                        setShoutouts(prev => prev.filter(s => s.id !== modalShoutout.id));
                        setModalShoutout(null);
                      } catch (e) { alert(e.message || 'Failed to delete'); }
                    }}
                  >Delete Shoutout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
