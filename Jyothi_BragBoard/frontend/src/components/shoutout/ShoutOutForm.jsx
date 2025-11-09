import React, { useState, useEffect, useRef } from "react";
import ApiService from "../../services/api";
import { ImageIcon } from "lucide-react";

const ShoutOutForm = ({ currentUser, onShoutoutPosted }) => {
  const [message, setMessage] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [showReceiverDropdown, setShowReceiverDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const receiverRef = useRef();
  const tagRef = useRef();

  // -------------------- FETCH USERS --------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await ApiService.getAllUsers();
        setAllUsers(users);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();

    const handleClickOutside = (e) => {
      if (receiverRef.current && !receiverRef.current.contains(e.target)) {
        setShowReceiverDropdown(false);
      }
      if (tagRef.current && !tagRef.current.contains(e.target)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------------------- TAG USER --------------------
  const toggleTagUser = (user) => {
    if (taggedUsers.some((u) => u.id === user.id)) {
      setTaggedUsers(taggedUsers.filter((u) => u.id !== user.id));
    } else {
      setTaggedUsers([...taggedUsers, user]);
    }
  };

  const removeTag = (userId) => {
    setTaggedUsers(taggedUsers.filter((u) => u.id !== userId));
  };

  // -------------------- HANDLE IMAGE UPLOAD --------------------
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // -------------------- SUBMIT SHOUTOUT --------------------
  const handleSubmit = async () => {
    if (!message.trim() || !receiver || !category) {
      alert("Please fill in message, receiver, and category!");
      return;
    }

    try {
      await ApiService.createShoutout({
        title: "",
        message,
        receiver_id: receiver.id,
        tagged_user_ids: taggedUsers.map((u) => u.id),
        category,
        is_public: visibility,
        imageFile,
      });

      // Reset form
      setMessage("");
      setReceiver(null);
      setTaggedUsers([]);
      setCategory("");
      setVisibility("public");
      removeImage();

      setSuccessMessage("🎉 Shout-Out sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      if (onShoutoutPosted) onShoutoutPosted();
    } catch (err) {
      console.error("Failed to post shoutout:", err);
      alert("Failed to post shoutout: " + err.message);
    }
  };

  return (
        <div className="flex-1 p-6 min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-700 via-pink-500 to-indigo-500 text-transparent bg-clip-text">
            Create Shout-Out
        </h2>
        <p className="text-gray-500 mb-6">
            Appreciate your teammates by sending a message of recognition 🌟
        </p>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Message */}
      <textarea
        className="w-full h-36 p-4 border rounded-lg hover:border-violet-500 mb-4 resize-none bg-white shadow-sm"
        placeholder="Write your shoutout..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {/* Receiver */}
      <div className="relative mb-4" ref={receiverRef}>
        <button
          className="w-full text-left p-3 border rounded-lg hover:border-violet-500 focus:outline-none bg-white shadow-sm"
          onClick={() => setShowReceiverDropdown(!showReceiverDropdown)}
        >
          {receiver ? receiver.username : "Select Receiver"}
        </button>
        {showReceiverDropdown && (
          <div className="absolute w-full max-h-60 overflow-y-auto border bg-white z-50 mt-1 rounded-lg shadow-lg">
            {allUsers
              .filter((u) => u.id !== currentUser.id)
              .map((u) => (
                <div
                  key={u.id}
                  className="p-2 cursor-pointer hover:bg-violet-100 transition-colors"
                  onClick={() => {
                    setReceiver(u);
                    setShowReceiverDropdown(false);
                  }}
                >
                  {u.username} | {u.department} | {u.role}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Tag People */}
      <div className="relative mb-4" ref={tagRef}>
        <button
          className="w-full text-left p-3 border rounded-lg hover:border-violet-500 focus:outline-none bg-white shadow-sm flex flex-wrap gap-1 items-center min-h-[2.5rem]"
          onClick={() => setShowTagDropdown(!showTagDropdown)}
        >
          {taggedUsers.length === 0 ? (
            <span>Tag People</span>
          ) : (
            <>
              <span className="text-gray-600 font-semibold text-sm">Tagged:</span>
              {taggedUsers.map((u) => (
                <span
                  key={u.id}
                  className="flex items-center gap-1 bg-violet-200 text-violet-800 px-2 py-1 rounded-full text-sm"
                >
                  {u.username}
                  <button
                    type="button"
                    className="font-bold hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent dropdown toggle
                      removeTag(u.id);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </>
          )}
        </button>

        {showTagDropdown && (
          <div className="absolute w-full max-h-60 overflow-y-auto border bg-white z-50 mt-1 rounded-lg shadow-lg">
            {allUsers
              .filter((u) => u.id !== currentUser.id)
              .map((u) => (
                <div
                  key={u.id}
                  className={`p-2 cursor-pointer hover:bg-violet-100 transition-colors ${
                    taggedUsers.some((t) => t.id === u.id)
                      ? "bg-violet-200 font-semibold"
                      : ""
                  }`}
                  onClick={() => toggleTagUser(u)}
                >
                  {u.username} | {u.department} | {u.role}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="cursor-pointer inline-flex items-center gap-2 p-3 border rounded-lg hover:border-violet-500 bg-white shadow-sm">
          <ImageIcon size={20} />
          <span>Upload Image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
        {imageFile && (
          <div className="mt-2 flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-max">
            <span className="text-sm">{imageFile.name}</span>
            <button
              type="button"
              className="text-red-500 font-bold hover:text-red-700"
              onClick={removeImage}
            >
              ❌
            </button>
          </div>
        )}
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 w-40 rounded-lg border"
          />
        )}
      </div>

      {/* Category */}
      <div className="mb-4">
        <select
          className="w-full p-3 border rounded-lg focus:outline-none hover:border-violet-500 bg-white shadow-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>
            Select Category
          </option>
          <option value="teamwork">Teamwork</option>
          <option value="innovation">Innovation</option>
          <option value="leadership">Leadership</option>
          <option value="customer_service">Customer Service</option>
          <option value="problem_solving">Problem Solving</option>
          <option value="mentorship">Mentorship</option>
        </select>
      </div>

      {/* Visibility */}
      <div className="mb-6">
        <select
          className="w-full p-3 border rounded-lg focus:outline-none hover:border-violet-500 bg-white shadow-sm"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="department_only">Department Only</option>
        </select>
      </div>

      {/* Post Button */}
      <button
        className="w-full bg-violet-500 hover:bg-violet-600 text-white font-semibold py-3 rounded-lg transition-all shadow-md"
        onClick={handleSubmit}
      >
        Post Shout-Out 🚀
      </button>
    </div>
  );
};

export default ShoutOutForm;
