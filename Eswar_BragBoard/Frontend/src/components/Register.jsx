import { useState } from 'react';
import apiService from '../services/api';

const Register = ({ onSuccess, onToggleMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    
    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 6) strength++;
      if (value.length >= 10) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      console.log('Form data before sending:', registrationData);
      
      const registerResponse = await apiService.register(registrationData);
      localStorage.setItem('access_token', registerResponse.access_token);
      localStorage.setItem('refresh_token', registerResponse.refresh_token);
      
      const userProfile = await apiService.getUserProfile();
      
      const userData = {
        ...registerResponse,
        ...userProfile
      };
      
      onSuccess(userData);
    } catch (err) {
      console.error('Registration error in component:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-400';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-8 right-20 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -top-40 right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10 max-h-[90vh] overflow-y-auto">
        {/* Card Container */}
        <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Logo Icon */}
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50 group-hover:shadow-emerald-500/75 transition-all duration-300 transform group-hover:scale-110">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
              Join BragBoard
            </h1>
            <p className="text-sm text-gray-300 font-medium tracking-wide">
              Create your account and start celebrating
            </p>
          </div>

          {/* Form Section */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div className="rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 p-4 border border-red-500/30 backdrop-blur-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-red-300 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-200 mb-2 ml-1">
                Full Name
              </label>
              <div className="relative group/input">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200 group-hover/input:border-white/40"
                  placeholder="John Doe"
                />
                <svg className="absolute right-4 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group/input">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200 group-hover/input:border-white/40"
                  placeholder="you@example.com"
                />
                <svg className="absolute right-4 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Department Select */}
            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-gray-200 mb-2 ml-1">
                Department
              </label>
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-gray-300">Select your department</option>
                <option value="Engineering" className="bg-slate-900 text-white">Engineering</option>
                <option value="Marketing" className="bg-slate-900 text-white">Marketing</option>
                <option value="Sales" className="bg-slate-900 text-white">Sales</option>
                <option value="Human Resources" className="bg-slate-900 text-white">Human Resources</option>
                <option value="Finance" className="bg-slate-900 text-white">Finance</option>
                <option value="Design" className="bg-slate-900 text-white">Design</option>
                <option value="Operations" className="bg-slate-900 text-white">Operations</option>
              </select>
              <svg className="absolute right-4 pointer-events-none h-5 w-5 text-gray-400 mt-[-2.5rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Role Select */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-200 mb-2 ml-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="employee" className="bg-slate-900 text-white">Employee</option>
                <option value="admin" className="bg-slate-900 text-white">Admin</option>
              </select>
              <svg className="absolute right-4 pointer-events-none h-5 w-5 text-gray-400 mt-[-2.5rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2 ml-1">
                Password
              </label>
              <div className="relative group/input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200 group-hover/input:border-white/40"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-2.5 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full flex-1 transition-all ${
                          i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-600'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {passwordStrength <= 2 ? 'Weak password' : passwordStrength <= 3 ? 'Moderate password' : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-200 mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative group/input">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200 group-hover/input:border-white/40"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-2.5 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <p className={`text-xs mt-1 font-medium ${
                  formData.password === formData.confirmPassword
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {formData.password === formData.confirmPassword
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 w-4 h-4 accent-cyan-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-300 cursor-pointer">
                I agree to the <span className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms of Service</span> and <span className="text-cyan-400 hover:text-cyan-300 transition-colors">Privacy Policy</span>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 hover:shadow-purple-500/75 hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-400 font-medium">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <button
              type="button"
              onClick={onToggleMode}
              className="w-full py-2.5 px-4 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5 backdrop-blur-sm"
            >
              Sign In Instead
            </button>
          </form>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            We'll never share your data with anyone. Read our <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Register;
