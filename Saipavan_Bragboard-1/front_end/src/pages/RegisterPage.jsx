import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/apiService.js';
import '../styles/SharedStyles.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
  });

  const navigate = useNavigate();

  // This effect runs whenever the password changes to check its strength
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [password]);

  const passwordsMatch = password && password === confirmPassword;
  const isPasswordValid = passwordValidation.length && passwordValidation.uppercase && passwordValidation.number;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch || !isPasswordValid) {
      setError("Please ensure passwords match and meet all strength requirements.");
      return;
    }
    setError(null);
    try {
      await registerUser({ name, email, password, department });
      alert('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

 const StrengthCheck = ({ text, isValid }) => (
    <div className={`strength-check ${isValid ? 'strength-valid' : 'strength-invalid'}`}>
      <svg 
        width="16" 
        height="16" 
        style={{ marginRight: '0.5rem' }}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isValid ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}></path>
      </svg>
      <span>{text}</span>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Get started with BragBoard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="p-3 text-red-800 bg-red-100 rounded-lg">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" placeholder="Your Name" />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address (company email preferred, e.g., @company.com)</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" placeholder="you@company.com" />
          </div>

          <div className="form-group">
            <label htmlFor="department" className="form-label">Department</label>
            <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required className="form-input">
              <option value="" disabled>Select your department</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" placeholder="••••••••" />
            <div className="password-strength-meter">
              <StrengthCheck text="At least 8 characters" isValid={passwordValidation.length} />
              <StrengthCheck text="At least one uppercase letter" isValid={passwordValidation.uppercase} />
              <StrengthCheck text="At least one number" isValid={passwordValidation.number} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="form-input" placeholder="••••••••" />
          </div>

          <button type="submit" className="auth-button" disabled={!passwordsMatch || !isPasswordValid}>
            Create Account
          </button>
        </form>

        <div className="auth-link-container">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;