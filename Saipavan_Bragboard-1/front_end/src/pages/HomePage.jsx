import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SharedStyles.css'; // Corrected stylesheet import

function HomePage() {
  return (
    <div className="home-container">
      {/* Left Column: Hero Content */}
      <div className="hero-section">
        <div>
          <h1 className="hero-title">
            Welcome to BragBoard
          </h1>
          <p className="hero-subtitle">
            An internal recognition tool for workplaces that lets employees appreciate their colleagues by posting shout-outs.
          </p>
          <div className="hero-button-group">
            <Link to="/login" className="hero-button btn-primary">
              Login
            </Link>
            <Link to="/register" className="hero-button btn-secondary">
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Key Features */}
      <div className="features-section">
        <div>
          <h2 className="features-title">Key Features</h2>
          <ul className="features-list">
            <li className="feature-item">
              <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m3-.75H9M9 12l2.25 2.25M15 12l-2.25 2.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="feature-text">Send shout-outs to your teammates to show appreciation.</span>
            </li>
            <li className="feature-item">
              <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              <span className="feature-text">Tag multiple colleagues in a single post.</span>
            </li>
            <li className="feature-item">
              <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              <span className="feature-text">React to posts with likes, claps, and stars.</span>
            </li>
            <li className="feature-item">
              <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-1.006A11.96 11.96 0 003 16.5c0-1.807.57-3.477 1.536-4.897A9.954 9.954 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
              <span className="feature-text">Engage with your team through a built-in commenting system.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HomePage;