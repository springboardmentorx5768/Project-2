import React, { useState, useEffect } from 'react';
import { getShoutouts, getAvailableDepartments, getAvailableSenders } from '../../api/apiService.js';
import ShoutoutCard from '../shoutout/ShoutoutCard.jsx';

function MainContentArea() {
  const [shoutouts, setShoutouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ sent: 0, received: 0, reactions: 0, comments: 0 });
  
  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    sender_id: '',
    sender_email: '',
    date_from: '',
    date_to: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableSenders, setAvailableSenders] = useState([]);

  const fetchShoutouts = async (filterParams = null) => {
    try {
      setIsLoading(true);
      const params = filterParams || filters;
      
      // Remove empty filter values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '' && value !== null)
      );
      
      const data = await getShoutouts(cleanParams);
      setShoutouts(data);
      
      // Calculate basic stats
      const totalReactions = data.reduce((acc, shoutout) => 
        acc + (shoutout.reactions?.length || 0), 0);
      const totalComments = data.reduce((acc, shoutout) => 
        acc + (shoutout.comments?.length || 0), 0);
      
      setStats({
        sent: data.length,
        received: 0, // This would need user-specific data
        reactions: totalReactions,
        comments: totalComments
      });
    } catch (err) {
      console.error('Failed fetching shoutouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [departments, senders] = await Promise.all([
        getAvailableDepartments(),
        getAvailableSenders()
      ]);
      setAvailableDepartments(departments);
      setAvailableSenders(senders);
    } catch (err) {
      console.error('Failed fetching filter options:', err);
    }
  };

  useEffect(() => {
    fetchShoutouts();
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    fetchShoutouts();
  };

  const clearFilters = () => {
    const emptyFilters = {
      department: '',
      sender_id: '',
      sender_email: '',
      date_from: '',
      date_to: ''
    };
    setFilters(emptyFilters);
    fetchShoutouts(emptyFilters);
  };

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">🎉</div>
      <h3>No shout-outs yet</h3>
      <p>Create your first shout-out</p>
      <button 
        className="button"
        onClick={() => window.location.href = '/create-shoutout'}
      >
        Create Shout-Out
      </button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="loading-state">
      {[1, 2, 3].map(i => (
        <div key={i} className="shoutout-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-info">
              <div className="skeleton-line skeleton-name"></div>
              <div className="skeleton-line skeleton-time"></div>
            </div>
          </div>
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-text-1"></div>
            <div className="skeleton-line skeleton-text-2"></div>
            <div className="skeleton-line skeleton-text-3"></div>
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="header-content">
          <h1>Feed</h1>
          <p className="subtitle">Recent shout-outs</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.sent}</div>
            <div className="stat-label">Shout-outs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.reactions}</div>
            <div className="stat-label">Reactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.comments}</div>
            <div className="stat-label">Comments</div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="filters-section premium-filters">
          <div className="filters-header">
            <div className="filters-title">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M3 5H21" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15"/>
                <path d="M6 9L11 14L18 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <div className="filters-heading">Advanced Filters</div>
                <div className="filters-sub">Narrow your feed by department, sender or date</div>
              </div>
            </div>
            <div className="filters-actions-inline">
              <button className="clear-filters-btn small" onClick={clearFilters}>Reset</button>
              <button className="apply-filters-btn small" onClick={applyFilters}>Apply</button>
            </div>
          </div>

          <div className="filters-body">
            <div className="filters-left">
              <div className="filter-group compact">
                <label>Department</label>
                <select
                  id="department-filter"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="filter-select premium"
                >
                  <option value="">All Departments</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group compact">
                <label>Sender</label>
                <select
                  id="sender-filter"
                  value={filters.sender_id}
                  onChange={(e) => handleFilterChange('sender_id', e.target.value)}
                  className="filter-select premium"
                >
                  <option value="">All Senders</option>
                  {availableSenders.map(sender => (
                    <option key={sender.id} value={sender.id}>
                      {sender.full_name} ({sender.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filters-right">
              <div className="filter-group date-row">
                <div>
                  <label>From</label>
                  <input type="date" value={filters.date_from} onChange={(e) => handleFilterChange('date_from', e.target.value)} className="filter-input premium"/>
                </div>
                <div>
                  <label>To</label>
                  <input type="date" value={filters.date_to} onChange={(e) => handleFilterChange('date_to', e.target.value)} className="filter-input premium"/>
                </div>
              </div>

              <div className="filter-chips">
                {/* Render active chips */}
                {filters.department && <button className="filter-chip" onClick={() => handleFilterChange('department', '')}>{filters.department} ✕</button>}
                {filters.sender_id && (() => {
                  const s = availableSenders.find(x => String(x.id) === String(filters.sender_id));
                  return s ? <button key={s.id} className="filter-chip" onClick={() => handleFilterChange('sender_id', '')}>{s.full_name} ✕</button> : null;
                })()}
                {filters.date_from && <button className="filter-chip" onClick={() => handleFilterChange('date_from', '')}>From: {filters.date_from} ✕</button>}
                {filters.date_to && <button className="filter-chip" onClick={() => handleFilterChange('date_to', '')}>To: {filters.date_to} ✕</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="content-body">
        {isLoading ? (
          renderLoadingState()
        ) : shoutouts.length > 0 ? (
          <div className="shoutouts-feed">
            {shoutouts.map((item) => (
              <ShoutoutCard key={item.id} shoutout={item} onUpdate={fetchShoutouts} />
            ))}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </main>
  );
}

export default MainContentArea;