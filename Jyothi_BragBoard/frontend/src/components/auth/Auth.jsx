import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const Auth = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("landing");
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (response) => {
    setUser(response);
    onAuthSuccess(response);
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Welcome to BragBoard!
          </h2>
          <p className="text-gray-600 mb-6">
            You’re successfully {mode === "login" ? "signed in" : "registered"}.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              setUser(null);
              setMode("landing");
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium px-6 py-2.5 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (mode === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-white to-purple-300 flex items-center justify-center px-6 sm:px-12 lg:px-24 animate-fadeIn">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* Left Section */}
          <div className="max-w-lg">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              BragBoard
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Empower your workplace with appreciation.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Celebrate achievements, recognize efforts, and inspire your team.
              BragBoard helps employees give shout-outs, build morale, and
              nurture a culture of recognition — all in one place.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setMode("login")}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-md hover:opacity-90 transition transform hover:scale-105"
              >
                Login
              </button>
              <button
                onClick={() => setMode("register")}
                className="px-8 py-3 bg-white text-indigo-700 border border-indigo-300 rounded-xl shadow-md hover:bg-indigo-50 transition transform hover:scale-105"
              >
                Register
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1 hidden lg:flex justify-center">
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl p-10 text-center w-96">
              <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
                “Give Shout-Outs That Matter!”
              </h2>
              <p className="text-gray-600">
                Recognize your colleagues’ hard work, spread positivity, and make
                your team stronger — one shout-out at a time.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return mode === "login" ? (
    <Login onSuccess={handleAuthSuccess} onToggleMode={() => setMode("register")} />
  ) : (
    <Register onSuccess={handleAuthSuccess} onToggleMode={() => setMode("login")} />
  );
};

export default Auth;
