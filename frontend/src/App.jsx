import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard/EmployeeDashboard";
import AdminLogin from "./admin/Adminlogin";

function App() {
  

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing page → Login */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />          
          <Route path="/dashboard" element={<Dashboard />} />

          {/** Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
          {/* Optional: redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
