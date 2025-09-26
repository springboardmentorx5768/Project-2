import Navbar from "../../components/Navbar";
import "../AdminDashboard/AdminDashboard.scss";

export default function AdminDashboard() {
  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin!</p>
      </div>
    </>
  );
}
