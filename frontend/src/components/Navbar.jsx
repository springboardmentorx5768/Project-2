import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.scss";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // get current path
  const isLoggedIn = !!localStorage.getItem("access_token"); 
  const role = localStorage.getItem("role"); // get user role

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");

    alert("Logged out successfully!");
    navigate("/login"); 
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">Bragboard</div>
      <ul className="nav-links">
        {/* Only show Home if not on login/register page */}
        {location.pathname !== "/login" && location.pathname !== "/register" && (
          <li><Link to="/">Home</Link></li>
        )}

        {/* Only show Dashboard for admins */}
        {role === "admin" && (
          <li><Link to="/dashboard">Dashboard</Link></li>
        )}

        {/* Login / Logout */}
        {isLoggedIn ? (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}

        {/* Register link only if not logged in */}
        {!isLoggedIn && <li><Link to="/register">Register</Link></li>}
      </ul>
    </nav>
  );
}
