import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
  return (
    <div className="home-container">
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>
      <div className="bg-shape bg-shape-3"></div>
      <div className="bg-shape bg-shape-4"></div>
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to
            <span className="hero-title-accent">BragBoard</span>
          </h1>
          
          <p className="hero-subtitle">
            Celebrate achievements and build stronger team connections through meaningful recognition.
          </p>
          
          <div className="hero-button-group">
            <Link to="/register" className="hero-button btn-primary">
              <span>Get Started</span>
              <div className="button-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
            <Link to="/login" className="hero-button btn-secondary">
              <div className="button-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-content">
          <div className="features-header">
            <h2 className="features-title">Why Teams Love <span className="features-brand-accent">BragBoard</span></h2>
            <p className="features-subtitle">
              Powerful features designed to foster recognition and build stronger workplace relationships
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236S7.321-.025 12 0C16.678-.025 18.75 4.236 18.75 4.236M18.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.395 4.972M18.75 4.236V4.5a9.85 9.85 0 01-2.48 5.228m0 0A9.904 9.904 0 0112 21c-2.67 0-5.182-1.054-7.02-2.927m0 0A9.85 9.85 0 012.52 9.772M14.47 9.728a7.454 7.454 0 00.982-3.172" />
                </svg>
              </div>
              <h3 className="feature-card-title">Recognition Made Easy</h3>
              <p className="feature-card-text">
                Send meaningful shout-outs to teammates with our intuitive interface. 
                Celebrate achievements and build team morale effortlessly.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="feature-card-title">Team Collaboration</h3>
              <p className="feature-card-text">
                Tag multiple colleagues, create team-wide recognition posts, 
                and foster collaborative appreciation across departments.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="feature-card-title">Interactive Reactions</h3>
              <p className="feature-card-text">
                Express appreciation with likes, claps, and stars. 
                Show support and engagement with diverse reaction options.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.691 1.35 3.061 3.016 3.061 1.414 0 2.68-.806 3.281-2.084C9.288 12.973 10.484 12 11.25 12s1.962.973 2.453 1.737C14.304 14.694 15.57 15.5 16.984 15.5c1.666 0 3.016-1.37 3.016-3.061v-8.439C20 2.109 18.891 1 17.5 1h-11C5.109 1 4 2.109 4 4v8.439z" />
                </svg>
              </div>
              <h3 className="feature-card-title">Smart Analytics</h3>
              <p className="feature-card-text">
                Track recognition trends, measure team engagement, 
                and gain insights into workplace culture and morale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;