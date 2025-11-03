import { useState, useEffect } from "react";
import ApiService from "../../services/api";

const Settings = ({ currentUser }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const departments = [
    "Engineering",
    "Marketing",
    "Human Resources",
    "Finance",
    "Design",
    "Sales",
    "Operations",
    "Product",
    "Support",
  ];

  const roles = ["employee", "admin"];

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.username || "");
      setEmail(currentUser.email || "");
      setDepartment(currentUser.department || "");
      setRole(currentUser.role || "employee"); // lowercase
    }
  }, [currentUser]);

  const isNoChange =
    name.trim() === (currentUser.username || "").trim() &&
    email.trim() === (currentUser.email || "").trim() &&
    department.trim() === (currentUser.department || "").trim() &&
    role.trim() === (currentUser.role || "").trim();

  // -------------------- UPDATE USER --------------------
  const handleUpdate = async () => {
    if (isNoChange) {
      setSuccessMessage("No changes to update.");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    try {
      const updatedUser = await ApiService.updateUser(currentUser.id, {
        username: name,
        email,
        department,
        role, // ✅ lowercase is sent to backend
      });

      localStorage.setItem("current_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update user: " + err.message);
    }
  };

  // -------------------- DELETE USER --------------------
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      await ApiService.deleteUser(currentUser.id);
      alert("Your account has been deleted.");
      localStorage.removeItem("access_token");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user: " + err.message);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50 p-8">
      <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 text-transparent bg-clip-text">
          Settings
        </h2>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-lg shadow-sm animate-fadeIn">
            {successMessage}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-violet-300 focus:outline-none transition"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-violet-300 focus:outline-none transition"
          />
        </div>

        {/* Department */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-violet-300 focus:outline-none transition"
          >
            <option value="" disabled>Select Department</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Role */}
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-violet-300 focus:outline-none transition"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)} 
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleUpdate}
            disabled={isNoChange}
            className={`${
              isNoChange
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-violet-500 hover:bg-violet-600"
            } text-white font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-md`}
          >
            Update
          </button>

          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-md"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
