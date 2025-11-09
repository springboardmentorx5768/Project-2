import React, { useEffect, useMemo, useState } from 'react';
import { fetchEmployeesOfMonth, fetchDepartments } from '../api/apiService.js';

const MONTH_NAMES = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
];

export default function RecognitionHistoryPage() {
  const now = useMemo(() => new Date(), []);
  const [displayMonth, setDisplayMonth] = useState(now.getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const prettyMonth = (m, y) => `${MONTH_NAMES[(m - 1 + 12) % 12]} ${y}`;

  const shiftMonth = (delta) => {
    let m = displayMonth + delta;
    let y = displayYear;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setDisplayMonth(m);
    setDisplayYear(y);
  };

  const load = async (m = displayMonth, y = displayYear, dept = department) => {
    try {
      setLoading(true); setError('');
      const data = await fetchEmployeesOfMonth({
        month: m,
        year: y,
        department: dept || undefined,
        limit: 100,
        offset: 0,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [displayMonth, displayYear, department]);
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchDepartments();
        setDepartments(Array.isArray(list) ? list : []);
      } catch (_) { /* ignore */ }
    })();
  }, []);

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="header-content">
          <h1>Employee of the Month</h1>
          <p className="subtitle">Celebrate those shining bright across the team</p>
        </div>
      </div>

      {/* Month navigation & filter */}
      <div className="card eom-hero">
        <div className="eom-hero-header">
          <button className="eom-nav-btn" onClick={() => shiftMonth(-1)} aria-label="Previous Month">‹</button>
          <div className="eom-month-display" title="Change month">
            <select
              aria-label="Month"
              className="form-input eom-month-select"
              value={displayMonth}
              onChange={(e) => setDisplayMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((n, idx) => (
                <option key={n} value={idx+1}>{n}</option>
              ))}
            </select>
            <input
              aria-label="Year"
              className="form-input eom-year-input"
              type="number"
              min={2000}
              max={3000}
              value={displayYear}
              onChange={(e) => setDisplayYear(Number(e.target.value) || now.getFullYear())}
            />
          </div>
          <button className="eom-nav-btn" onClick={() => shiftMonth(1)} aria-label="Next Month">›</button>
        </div>

        <div className="eom-hero-sub">
          <div className="subtitle">{prettyMonth(displayMonth, displayYear)}</div>
          <div className="eom-filters">
            <label className="form-label" htmlFor="eom-dept">Department</label>
            <select id="eom-dept" className="form-input" value={department} onChange={(e)=> setDepartment(e.target.value)}>
              <option value="">All</option>
              {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
        </div>

        {/* Cards grid */}
        {loading && (
          <div className="loading-state">
            {[...Array(3)].map((_,i)=>(<div key={i} className="shoutout-skeleton" style={{ height:'72px' }} />))}
          </div>
        )}
        {!loading && error && (
          <div className="card" style={{ background:'#fef2f2', borderColor:'#fecaca' }}>{error}</div>
        )}
        {!loading && !error && (
          rows.length > 0 ? (
            <div className="eom-card-grid">
              {rows.map(r => (
                <article key={r.id} className="eom-card" aria-label={`Employee of the Month: ${r.user_name || 'Unknown'}`}>
                  <div className="eom-card-left">
                    <div className="eom-avatar">{(r.user_name || 'U').charAt(0)}</div>
                  </div>
                  <div className="eom-card-body">
                    <h3 className="eom-card-title">
                      {r.user_name || 'Unknown'}
                      <span className="eom-badge" title="Employee of the Month">★</span>
                    </h3>
                    <div className="eom-meta">
                      <span className="dept-chip">{r.department || 'All Departments'}</span>
                      <span className="date-chip">{r.month}/{r.year}</span>
                    </div>
                    {r.note && (
                      <p className="eom-note">{r.note}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: 0 }}>
              <div className="empty-state-icon">🌟</div>
              <h3>No employees selected for this month</h3>
              <p>Choose another month to browse past recognition.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
