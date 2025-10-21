// In: front_end/src/pages/LoginPage.jsx
// (REPLACE the entire file with this)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { loginUser, getCurrentUser } from '../api/apiService.js';
import '../styles/LoginPage.css'; // Import the new stylesheet

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // --- THIS IS THE FIX ---
      // We must pass a single object that maps 'email' to 'username'
      // so the backend's OAuth2PasswordRequestForm receives what it expects.
      const credentials = {
        username: email,
        password: password
      };

      // Pass the single 'credentials' object
      const response = await loginUser(credentials);

      // The token is on 'response.data'
      const token = response.data.access_token;
      login(token);

      // Verify token by fetching current user before navigating.
      // If this fails we'll surface the exact 401 error.
      try {
        const me = await getCurrentUser();
        // Optional: you can use me.data for any UI updates. Proceed to dashboard.
        navigate('/dashboard');
      } catch (meErr) {
        // If fetching current user fails, remove token and show detailed error
        console.error('Token verification failed after login:', meErr?.response || meErr);
        alert('Login failed: token verification failed. Check server logs.');
        // logout by removing token from localStorage via AuthContext's logout if available
        // (we only have login here) — remove token directly to avoid stale auth state
        localStorage.removeItem('token');
      }
      
    } catch (err) {
      // axios error objects include `response` with status & data. Print that for diagnostics.
      console.error('Login request failed:', err?.response ?? err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 401) {
        alert('Login Failed: Incorrect email or password (401).');
      } else {
        alert(`Login Failed: ${status ?? 'network error'}`);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="brand-title">BragBoard</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="form-input" placeholder="you@company.com" 
            />
          </div>
          <div className="input-group">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <input
              id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="form-input" placeholder="Password"
            />
          </div>
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        <div className="login-link-container">
          Don't have an account?{' '}
          <Link to="/register" className="login-link">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;