import { useState } from 'react';
import apiService from '../services/api';

const Login = ({ onSuccess, onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginResponse = await apiService.login(formData);
      localStorage.setItem('access_token', loginResponse.access_token);
      localStorage.setItem('refresh_token', loginResponse.refresh_token);
      
      const userProfile = await apiService.getUserProfile();
      
      const userData = {
        ...loginResponse,
        ...userProfile
      };
      
      onSuccess(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-8 right-20 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -top-40 right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Card Container */}
        <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            {/* Logo Icon */}
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/75 transition-all duration-300 transform group-hover:scale-110">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              BragBoard
            </h1>
            <p className="text-sm text-gray-300 font-medium tracking-wide">
              Welcome back to your space
            </p>
          </div>

          {/* Form Section */}
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            {/* Email Input */}
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3 ml-1">
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
                  className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:bg-white/15 focus:ring-2 focus:ring-violet-500/30 transition-all duration-200 group-hover/input:border-white/40"
                  placeholder="you@example.com"
                />
                <svg className="absolute right-4 top-12 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-3 ml-1">
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
                  className="w-full px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:bg-white/15 focus:ring-2 focus:ring-violet-500/30 transition-all duration-200 group-hover/input:border-white/40"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-12 text-gray-400 hover:text-gray-200 transition-colors"
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
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 hover:shadow-purple-500/75 hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-400 font-medium">
                  New to BragBoard?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <button
              type="button"
              onClick={onToggleMode}
              className="w-full py-3 px-4 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5 backdrop-blur-sm"
            >
              Create an Account
            </button>
          </form>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
            By signing in, you agree to our <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Terms of Service</span> and <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
          </p>
        </div>

        {/* Bottom Accent */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          BragBoard © 2024 • Share your achievements
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

export default Login;
