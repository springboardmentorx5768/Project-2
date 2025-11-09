import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/apiService.js';
import '../styles/RegisterStyles.css';
import { getStates, getCitiesForState } from '../data/locations.js';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [cityValue, setCityValue] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    console.log('RegisterPage mounted');
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [password]);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isPasswordValid = passwordValidation.length && passwordValidation.uppercase && passwordValidation.number;
  const phoneOk = /^\+?\d{10,15}$/.test(phone.trim());
  const locationOk = Boolean(stateValue) && Boolean(cityValue);
  const isFormValid = fullName.trim() && email.trim() && department && passwordsMatch && isPasswordValid && phoneOk && locationOk;

  const doRegister = async (userData) => {
    setLoading(true);
    try {
      console.log('doRegister called with', userData);
      const response = await registerUser(userData);
      console.log('Registration succeeded', response);
      
      // Show success message with better UX
      const successDiv = document.createElement('div');
      successDiv.className = 'success-message';
      successDiv.innerHTML = `
        <div class="success-content">
          <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h3>Account Submitted!</h3>
          <p>Your registration is pending admin approval. You will be able to log in once approved.</p>
          <p style="margin-top:0.5rem; font-size:0.85rem; opacity:0.8;">You can close this tab or proceed to login to check status later.</p>
        </div>
      `;
      document.body.appendChild(successDiv);
      // Longer timeout so user can read the approval message
      setTimeout(() => {
        if (document.body.contains(successDiv)) document.body.removeChild(successDiv);
        navigate('/login');
      }, 5000);
      
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data) {
        errorMessage = err.response.data.detail || err.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate all form fields
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!department) {
      setError('Please select your department.');
      return;
    }
    if (!phoneOk) {
      setError('Please enter a valid phone number (10–15 digits).');
      return;
    }
    if (!locationOk) {
      setError('Please select your state and city.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must meet all strength requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    console.log('Register submit:', { fullName, email, department, phone, state: stateValue, city: cityValue });
    
    const userData = {
      full_name: fullName,
      email,
      password,
      department,
      phone,
      location: `${cityValue}, ${stateValue}`,
    };
    await doRegister(userData);
  };

  const StrengthCheck = ({ text, isValid }) => (
    <div className={`strength-check ${isValid ? 'strength-valid' : 'strength-invalid'}`}>
      <div className="strength-icon">
        {isValid ? (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        ) : (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        )}
      </div>
      <span>{text}</span>
    </div>
  );

  const PasswordToggle = ({ show, onToggle, inputId }) => (
    <button 
      type="button" 
      className="password-toggle" 
      onClick={onToggle}
      onMouseDown={(e) => e.preventDefault()}
    >
      {show ? (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
        </svg>
      ) : (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      )}
    </button>
  );

  return (
    <div className="register-container">
      {/* Background Elements */}
      <div className="register-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>

      <div className="register-card">
        {/* Header Section */}
        <div className="register-header">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="brand-title">Create Account</h1>
          <p className="register-subtitle">Join <span className="brand-highlight">BragBoard</span> and celebrate success together</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="error-message">
              <div className="error-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          {/* Full Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <input 
                id="name" 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                className="form-input" 
                placeholder="Enter your full name" 
              />
              {fullName && (
                <div className="input-status valid">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="form-input" 
                placeholder="you@company.com" 
              />
              {email && email.includes('@') && (
                <div className="input-status valid">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Department Field */}
          <div className="form-group">
            <label htmlFor="department" className="form-label">Department</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <select 
                id="department" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
                required 
                className="form-input form-select"
              >
                <option value="" disabled>Choose your department</option>
                <option value="Engineering">🔧 Engineering</option>
                <option value="Sales">📈 Sales</option>
                <option value="Marketing">📢 Marketing</option>
                <option value="Human Resources">👥 Human Resources</option>
                <option value="Design">🎨 Design</option>
                <option value="Product">📱 Product</option>
                <option value="Finance">💰 Finance</option>
                <option value="Operations">⚙️ Operations</option>
              </select>
              <div className="select-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3l2 4-2 1a11 11 0 005 5l1-2 4 2v3a2 2 0 01-2 2h-1C9.82 18 6 14.18 6 9V8a2 2 0 00-2-2H3z" />
                </svg>
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="form-input"
                placeholder="Enter phone number"
              />
              {phone && (
                <div className={`input-status ${phoneOk ? 'valid' : 'invalid'}`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {phoneOk ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Location: State and City */}
          <div className="form-group">
            <label className="form-label">Location</label>
            <div className="grid-two">
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 12.414A4 4 0 1112.414 11.4l4.243 4.243z" />
                  </svg>
                </div>
                <select
                  id="state"
                  value={stateValue}
                  onChange={(e) => { setStateValue(e.target.value); setCityValue(''); }}
                  required
                  className="form-input form-select"
                >
                  <option value="" disabled>Select state</option>
                  {getStates().map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="select-arrow">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <div className="input-wrapper">
                <div className="input-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"></path>
                  </svg>
                </div>
                <select
                  id="city"
                  value={cityValue}
                  onChange={(e) => setCityValue(e.target.value)}
                  required
                  className="form-input form-select"
                  disabled={!stateValue}
                >
                  <option value="" disabled>{stateValue ? 'Select city' : 'Select state first'}</option>
                  {getCitiesForState(stateValue).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="select-arrow">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="form-input" 
                placeholder="Create a strong password" 
              />
              <PasswordToggle 
                show={showPassword} 
                onToggle={() => setShowPassword(!showPassword)} 
                inputId="password" 
              />
            </div>
            {password && (
              <div className="password-strength-meter">
                <div className="strength-header">
                  <span>Password Requirements:</span>
                  <div className={`strength-score ${isPasswordValid ? 'strong' : passwordValidation.length ? 'medium' : 'weak'}`}>
                    {isPasswordValid ? 'Strong' : passwordValidation.length ? 'Medium' : 'Weak'}
                  </div>
                </div>
                <div className="strength-checks">
                  <StrengthCheck text="At least 8 characters" isValid={passwordValidation.length} />
                  <StrengthCheck text="One uppercase letter" isValid={passwordValidation.uppercase} />
                  <StrengthCheck text="One number" isValid={passwordValidation.number} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <input 
                id="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                className="form-input" 
                placeholder="Confirm your password" 
              />
              <PasswordToggle 
                show={showConfirmPassword} 
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)} 
                inputId="confirmPassword" 
              />
            </div>
            {confirmPassword && (
              <div className="password-match-indicator">
                <StrengthCheck text="Passwords match" isValid={passwordsMatch} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className={`register-button ${loading ? 'loading' : ''}`} disabled={!isFormValid || loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <svg className="button-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="register-footer">
          <p className="register-link-text">
            Already have an account?{' '}
            <Link to="/login" className="register-link">
              Sign In
              <svg className="link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
