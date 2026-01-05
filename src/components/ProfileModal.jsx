import React, { useState } from "react";
import { X, Camera } from "lucide-react";
import { updateUserProfile } from "../api/userApi";

const ProfileModal = ({ user, onClose }) => {
  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.image || "");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      await updateUserProfile(user._id, formData); // ✅ correct
      onClose(); // ✅ close modal
    } catch (error) {
      console.error(error);
      alert("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          Update Profile
        </h2>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={preview || "/avatar.png"}
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border"
            />
            <label className="absolute bottom-1 right-1 bg-indigo-600 p-2 rounded-full cursor-pointer">
              <Camera size={16} className="text-white" />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          {/* Email */}
          <input
            value={user?.email}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
