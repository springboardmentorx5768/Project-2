import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Navbar.scss";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); 
    const userRole = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setRole(userRole || "");
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole("");
    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
  <a href="/">
    <img
      src="https://png.pngtree.com/png-clipart/20220627/original/pngtree-letter-b-logo-design-vector-sign-business-card-templates-png-image_8209135.png"
      alt="Bragboard Logo"
      className="logo-img"
    />
  </a>
  Bragboard
</div>

      <ul className="nav-links">
        {/* Always show Home unless on login/register page */}
        {location.pathname !== "/login" && location.pathname !== "/register" && (
          <li><Link to="/home">Home</Link></li>
        )}

        {/* Role-specific links */}
        {role === "employee" && (
          <>
            <li><Link to="/employee/dashboard">Dashboard</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </>
        )}

        {role === "admin" && (
          <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/AdminDashboard">Security Keys</Link></li>
            <li><Link to="/employee-list">Employee List</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </>
        )}

        {role === "superadmin" && (
          <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/AdminDashboard">Security Keys</Link></li>
            <li><Link to="/employee-list">Employee List</Link></li>
            <li><Link to="/admin-list">Admin List</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </>
        )}

        {/* Not logged-in links */}
        {!isLoggedIn && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}

        {/* Logout button for all logged-in users */}
        {isLoggedIn && (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
