// src/App.jsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingpage.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Shoutouts from "./pages/shoutouts.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shoutouts" element={<Shoutouts />} />
      </Routes>
    </div>
  );
}

export default App;
