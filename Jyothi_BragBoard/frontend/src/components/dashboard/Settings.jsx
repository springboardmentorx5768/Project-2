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

  const roles = ["Employee", "Admin"]; // role dropdown

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.username || "");
      setEmail(currentUser.email || "");
      setDepartment(currentUser.department || "");
      setRole(currentUser.role || "Employee");
    }
  }, [currentUser]);

  // -------------------- UPDATE USER --------------------
  const handleUpdate = async () => {
    try {
      await ApiService.updateUser(currentUser.id, {
        username: name,
        email,
        department,
        role,
      });

      setSuccessMessage("User updated successfully!");
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
      await ApiService.deleteUser(currentUser.id); // <-- deleting user account
      alert("Your account has been deleted.");
      localStorage.removeItem("access_token");
      window.location.reload(); // or redirect to login
    } catch (err) {
      console.error(err);
      alert("Failed to delete user: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 text-transparent bg-clip-text">
        Settings
      </h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg bg-white shadow-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg bg-white shadow-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Department</label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full p-3 border rounded-lg bg-white shadow-sm"
        >
          <option value="" disabled>Select Department</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-semibold">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 border rounded-lg bg-white shadow-sm"
        >
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleUpdate}
          className="bg-violet-500 hover:bg-violet-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          Update
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;
