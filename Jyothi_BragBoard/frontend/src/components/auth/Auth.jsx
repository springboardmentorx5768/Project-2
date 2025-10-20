import { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (response) => {
    setUser(response);
    onAuthSuccess(response);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to BragBoard!</h2>
              <p className="text-gray-600">You have successfully {isLogin ? 'signed in' : 'registered'}.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Access Token:</p>
              <p className="text-xs font-mono bg-white p-2 rounded mt-1 break-all">
                {user.access_token.substring(0, 50)}...
              </p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLogin ? (
        <Login onSuccess={handleAuthSuccess} onToggleMode={toggleMode} />
      ) : (
        <Register onSuccess={handleAuthSuccess} onToggleMode={toggleMode} />
      )}
    </>
  );
};

export default Auth;