// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/landingpage.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Dashboard from "./pages/dashboard.jsx";
import PostShoutout from "./pages/PostShoutout.jsx";
import ShoutoutFeed from "./pages/ShoutoutFeed.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";

function RequireAuth({ children }) {
  // simple token check — adjust if you prefer refresh-token flow
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — only accessible when access_token exists */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/postshoutout"
          element={
            <RequireAuth>
              <PostShoutout />
            </RequireAuth>
          }
        />
        <Route
          path="/shoutouts"
          element={
            <RequireAuth>
              <ShoutoutFeed />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />

        {/* Default redirect goes to /login to avoid infinite redirect-to-dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
