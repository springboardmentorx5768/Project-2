import React, { useState } from 'react';

// All CSS styles are now embedded directly within the component
// to resolve the file path errors.

function DashboardPage() {
  // Initial data is now stored in constants
  const initialFeedItems = [
    { id: 1, sender: { name: 'Jane Doe', initials: 'JD' }, message: 'Huge thanks to John for helping out with the deployment last night. Lifesaver! 🙌', timestamp: '2 hours ago' },
    { id: 2, sender: { name: 'John Smith', initials: 'JS' }, message: 'Shout-out to the entire design team for the amazing new mockups. They look fantastic!', timestamp: '5 hours ago' },
    { id: 3, sender: { name: 'Emily White', initials: 'EW' }, message: 'Welcome to the team, Alex! So excited to have you on board.', timestamp: '1 day ago' }
  ];

  const initialLeaderboard = [
    { id: 1, name: 'Jane Doe', initials: 'JD', score: 125 },
    { id: 2, name: 'John Smith', initials: 'JS', score: 98 },
    { id: 3, name: 'Peter Jones', initials: 'PJ', score: 76 },
    { id: 4, name: 'Emily White', initials: 'EW', score: 64 },
  ];

  // State for feed items and the new shoutout input
  const [feedItems, setFeedItems] = useState(initialFeedItems);
  const [leaderboard] = useState(initialLeaderboard);
  const [newShoutout, setNewShoutout] = useState('');

  // Handler to add a new shoutout
  const handlePostShoutout = () => {
    if (newShoutout.trim() === '') return; // Don't post empty messages

    const newPost = {
      id: Date.now(), // Use a unique ID
      sender: { name: 'Alex Ray', initials: 'AR' }, // Placeholder for the current user
      message: newShoutout,
      timestamp: 'Just now',
    };

    setFeedItems([newPost, ...feedItems]); // Add new post to the top of the feed
    setNewShoutout(''); // Clear the input field
  };


  const styles = `
    /* Global Styles & Variables */
    :root {
      --brand-violet: #6d28d9;
      --brand-violet-light: #ede9fe;
    }
    
    body {
      background-color: #f1f5f9; /* A light gray background */
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
    }

    /* NEW: Main Header Styles */
    .dashboard-header {
      background-color: #fff;
      padding: 1rem 2rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .header-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }
    .user-profile-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9999px;
      background-color: #1e293b;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      cursor: pointer;
    }

    /* Main grid container for the entire dashboard layout */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr; /* Default to a single column */
      gap: 1.5rem; /* 24px */
      padding: 1rem;
      max-width: 1280px;
      margin: 0 auto;
    }

    /* Medium screens and up (tablets) */
    @media (min-width: 768px) {
      .dashboard-grid {
        grid-template-columns: repeat(4, 1fr); /* 4 columns */
      }
    }

    /* Large screens and up (desktops) */
    @media (min-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: repeat(5, 1fr); /* 5 columns */
      }
    }

    /* Left Sidebar */
    .dashboard-sidebar {
      display: none;
    }
    @media (min-width: 768px) {
      .dashboard-sidebar {
        display: block;
        grid-column: span 1 / span 1;
      }
    }

    .sidebar-menu {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      color: #334155;
      font-weight: 500;
      border-radius: 0.5rem;
      text-decoration: none;
      transition: background-color 0.2s, color 0.2s;
    }

    .sidebar-link:hover {
      background-color: #e2e8f0;
    }
    
    .bg-violet-100 {
      background-color: var(--brand-violet-light);
      color: var(--brand-violet);
    }

    .sidebar-icon {
      height: 1.5rem;
      width: 1.5rem;
      margin-right: 0.75rem;
      color: #64748b;
    }
    
    .bg-violet-100 .sidebar-icon {
      color: var(--brand-violet);
    }

    /* Main Feed */
    .main-feed {
      grid-column: span 1 / span 1;
    }
    @media (min-width: 768px) {
      .main-feed {
        grid-column: span 3 / span 3;
      }
    }

    .create-post-card {
      padding: 1rem;
      background-color: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      border: 1px solid #e2e8f0;
    }

    .create-post-input {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 0.5rem;
      background-color: #f1f5f9;
      resize: vertical;
      box-sizing: border-box; /* Ensures padding doesn't affect width */
    }

    .create-post-input:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--brand-violet);
    }
    
    /* Shared Auth Button Style */
    .auth-button {
      padding: 0.75rem;
      background-color: #2563eb;
      color: #ffffff;
      font-weight: 600;
      font-size: 1rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .auth-button:hover {
      background-color: #1d4ed8;
    }
    .auth-button:disabled {
      background-color: #94a3b8;
      cursor: not-allowed;
    }


    /* Shoutout Card Styles */
    .shoutout-feed {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .shoutout-card {
      background-color: #fff;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      border: 1px solid #e2e8f0;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .shoutout-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }

    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }

    .avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 9999px;
      background-color: var(--brand-violet);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.125rem;
      margin-right: 1rem;
      flex-shrink: 0; /* Prevents avatar from shrinking */
    }

    .sender-name {
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .timestamp {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .card-body {
      color: #334155;
      line-height: 1.6;
      margin-top: 0;
      margin-bottom: 1rem;
      word-break: break-word; /* Prevents long text from overflowing */
    }

    .card-footer {
      display: flex;
      gap: 1.5rem;
      color: #475569;
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
    }
    
    .footer-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    .footer-action:hover {
      color: var(--brand-violet);
    }
    
    .footer-action svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    /* Right Sidebar */
    .right-sidebar {
      display: none;
    }
    @media (min-width: 1024px) {
      .right-sidebar {
        display: block;
        grid-column: span 1 / span 1;
      }
    }

    .leaderboard-card {
      background-color: #fff;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      border: 1px solid #e2e8f0;
    }

    .leaderboard-title {
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 1rem;
      font-size: 1.125rem;
    }

    .leaderboard-item {
      display: flex;
      align-items: center;
    }
    
    /* NEW: Leaderboard Rank Style */
    .leaderboard-rank {
      width: 1.5rem;
      font-weight: 700;
      color: #64748b;
      margin-right: 0.75rem;
      text-align: center;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      {/* NEW: Main Header */}
      <header className="dashboard-header">
        <h1 className="header-title">BragBoard</h1>
        <div className="user-profile-avatar">AR</div>
      </header>

      <div className="dashboard-grid">
        {/* Left Sidebar - Navigation */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-menu">
            <a href="#" className="sidebar-link bg-violet-100">
              <svg className="sidebar-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>
              Home
            </a>
            <a href="#" className="sidebar-link">
              <svg className="sidebar-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              Profile
            </a>
          </nav>
        </aside>

        {/* Center - Main Shout-Out Feed */}
        <main className="main-feed">
          <div className="create-post-card">
            <textarea 
              className="create-post-input" 
              rows="3" 
              placeholder="Write a shout-out..."
              value={newShoutout}
              onChange={(e) => setNewShoutout(e.target.value)}
            ></textarea>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem'}}>
              <button 
                className="auth-button" 
                style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
                onClick={handlePostShoutout}
                disabled={!newShoutout.trim()}
              >
                Post
              </button>
            </div>
          </div>
          
          <div className="shoutout-feed">
            {feedItems.map((item) => (
              <div key={item.id} className="shoutout-card">
                <div className="card-header">
                  <div className="avatar">{item.sender.initials}</div>
                  <div className="sender-info">
                    <p className="sender-name">{item.sender.name}</p>
                    <p className="timestamp">{item.timestamp}</p>
                  </div>
                </div>
                <p className="card-body">{item.message}</p>
                <div className="card-footer">
                  <span className="footer-action">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.424 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M6.633 10.5l-1.822 1.822a1.5 1.5 0 00-2.121 2.121L6.633 10.5z" /></svg>
                    Like
                  </span>
                  <span className="footer-action">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-.388A.75.75 0 019 19.125v-2.002c0-.414.336-.75.75-.75h.375a.75.75 0 01.75.75v1.5a.75.75 0 00.75.75h.375a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75h-.375a.75.75 0 01-.75-.75v-2.002a.75.75 0 00-.75-.75H9.75a.75.75 0 01-.75-.75v-1.5a.75.75 0 00-.75-.75H6.375a.75.75 0 00-.75.75v1.5a.75.75 0 01-.75.75H4.5a.75.75 0 00-.75.75v2.25a.75.75 0 00.75.75h.375a.75.75 0 01.75.75v2.002a.75.75 0 01-.75.75H3.75a.75.75 0 00-.75.75v-1.5A9.753 9.753 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                    Comment
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar - Leaderboard */}
        <aside className="right-sidebar">
          <div className="leaderboard-card">
            <h3 className="leaderboard-title">Leaderboard</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {leaderboard.map((user, index) => (
                <div key={user.id} className="leaderboard-item">
                  <span className="leaderboard-rank">{index + 1}</span>
                  <div className="avatar" style={{width: '2.5rem', height: '2.5rem', marginRight: '0.75rem', fontSize: '1rem'}}>{user.initials}</div>
                  <span style={{fontWeight: 500, color: '#334155', flexGrow: 1}}>{user.name}</span>
                  <span style={{marginLeft: 'auto', fontWeight: 'bold', color: '#64748b'}}>{user.score}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default DashboardPage;

