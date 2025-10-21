import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { loginUser } from '../api/apiService.js';
import '../styles/SharedStyles.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await loginUser(email, password);
      login(data.access_token);
      alert('Login Successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
      alert('Login Failed: Incorrect email or password.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Welcome back to BragBoard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="p-3 text-red-800 bg-red-100 rounded-lg">{error}</div>}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address / Username</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="form-input" placeholder="you@company.com" 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="form-input" placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="rememberMe" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <label htmlFor="rememberMe" className="text-slate-600">Remember me</label>
            </div>
            <Link to="/forgot-password" className="font-semibold text-violet-600 hover:underline">
              
            </Link>
          </div>

          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>
        <div className="auth-link-container">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;