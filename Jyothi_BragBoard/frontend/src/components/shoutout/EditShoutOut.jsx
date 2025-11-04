import React, { useState, useEffect, useRef } from "react";
import ApiService from "../../services/api";
import { ImageIcon } from "lucide-react";

const EditShoutOut = ({ shoutout, currentUser, onCancel, onUpdated }) => {
  const [message, setMessage] = useState(shoutout.message || "");
  const [allUsers, setAllUsers] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState(
    shoutout.tagged_users?.map(u => ({ id: u.id, username: u.username })) || []
  );
  const [category, setCategory] = useState(shoutout.category || "");
  const [visibility, setVisibility] = useState(shoutout.is_public || "public");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    shoutout.image_url ? `http://127.0.0.1:8000${shoutout.image_url}` : null
  );
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const tagRef = useRef();

  const originalData = {
    message: shoutout.message || "",
    category: shoutout.category || "",
    is_public: shoutout.is_public || "public",
    tagged_user_ids: shoutout.tagged_users?.map(u => u.id) || [],
    image_url: shoutout.image_url ? `http://127.0.0.1:8000${shoutout.image_url}` : null,
  };

  const isChanged = () => {
    const currentData = {
      message,
      category,
      is_public: visibility,
      tagged_user_ids: taggedUsers.map(u => u.id),
      image_url: imagePreview,
    };
    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await ApiService.getAllUsers();
        setAllUsers(users.filter(u => u.id !== currentUser.id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();

    const handleClickOutside = (e) => {
      if (tagRef.current && !tagRef.current.contains(e.target)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currentUser.id]);

  const toggleTagUser = (user) => {
    if (taggedUsers.some(u => u.id === user.id)) {
      setTaggedUsers(taggedUsers.filter(u => u.id !== user.id));
    } else {
      setTaggedUsers([...taggedUsers, user]);
    }
  };

  const removeTag = (userId) => {
    setTaggedUsers(taggedUsers.filter(u => u.id !== userId));
  };

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

  const handleUpdate = async () => {
    if (!isChanged()) return; 

    try {
      let image_url = shoutout.image_url || null;

      if (imageFile) {
        image_url = await ApiService.uploadImage(imageFile);
      } else if (!imagePreview) {
        image_url = null;
      }

      const payload = {
        message,
        category,
        is_public: visibility,
        tagged_user_ids: taggedUsers.map(u => u.id),
        image_url,
      };

      await ApiService.updateShoutout(shoutout.id, payload);
      onUpdated?.();
      onCancel?.();
    } catch (err) {
      console.error(err);
      alert("Failed to update shoutout");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-violet-600">Edit Shout-Out</h2>

      <textarea
        className="w-full h-32 p-3 border rounded-lg mb-4 bg-white shadow-sm resize-none"
        placeholder="Update your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="relative mb-4" ref={tagRef}>
        <button
          className="w-full text-left p-3 border rounded-lg bg-white shadow-sm flex flex-wrap gap-1 items-center min-h-[2.5rem]"
          onClick={(e) => { e.stopPropagation(); setShowTagDropdown(!showTagDropdown); }}
        >
          {taggedUsers.length === 0 ? (
            <span>Tag People</span>
          ) : (
            <>
              <span className="text-gray-600 font-semibold text-sm mr-1">Tagged:</span>
              {taggedUsers.map(u => (
                <span key={u.id} className="flex items-center gap-1 bg-violet-200 text-violet-800 px-2 py-1 rounded-full text-sm">
                  {u.username}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(u.id); }} className="font-bold hover:text-red-600">×</button>
                </span>
              ))}
            </>
          )}
        </button>

        {showTagDropdown && (
          <div className="absolute w-full max-h-60 overflow-y-auto border bg-white rounded-lg shadow-lg z-50 mt-1">
            {allUsers.map(u => (
              <div
                key={u.id}
                className={`p-2 cursor-pointer hover:bg-violet-100 transition-colors ${taggedUsers.some(t => t.id === u.id) ? "bg-violet-200 font-semibold" : ""}`}
                onClick={() => toggleTagUser(u)}
              >
                {u.username} | {u.department} | {u.role}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="cursor-pointer inline-flex items-center gap-2 p-3 border rounded-lg bg-white shadow-sm">
          <ImageIcon size={20} />
          <span>{imagePreview ? "Change Image" : "Upload Image"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        {imagePreview && (
          <div className="mt-2 flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-max">
            <img src={imagePreview} alt="Preview" className="w-40 rounded-lg border" />
            <button type="button" className="text-red-500 font-bold hover:text-red-700" onClick={removeImage}>❌</button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <select
          className="w-full p-3 border rounded-lg bg-white shadow-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>Select Category</option>
          <option value="teamwork">Teamwork</option>
          <option value="innovation">Innovation</option>
          <option value="leadership">Leadership</option>
          <option value="customer_service">Customer Service</option>
          <option value="problem_solving">Problem Solving</option>
          <option value="mentorship">Mentorship</option>
        </select>
      </div>

      <div className="mb-6">
        <select
          className="w-full p-3 border rounded-lg bg-white shadow-sm"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="department_only">Department Only</option>
        </select>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>

        <button
          onClick={handleUpdate}
          disabled={!isChanged()}
          className={`px-4 py-2 rounded-lg text-white transition ${
            isChanged()
              ? "bg-violet-500 hover:bg-violet-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default EditShoutOut;
