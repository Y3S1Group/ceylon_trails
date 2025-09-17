import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserProfileModal({ user, isOpen, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [localUser, setLocalUSer] = useState(user);

  useEffect(() => {
    setLocalUSer(user);
  }, [user]);

  if (!isOpen || !localUser) return null;

  // Deactivate user
  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      setLoading(true);
      const res = await axios.delete(`http://localhost:5006/api/admin/deactivtae-user/${localUser._id}`, { withCredentials: true });
      if (res.data.success) {
        alert(res.data.message);
        onClose();  // close the profile panel/modal
      }
    } catch (err) {
      console.error(err);
      alert("Failed to deactivate user.");
    } finally {
      setLoading(false);
    }
  };

  // Block / Unblock user
  const handleBlock = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`http://localhost:5006/api/admin/block-user/${user._id}`, {}, { withCredentials: true });
      if (res.data.success) {
        alert(res.data.message);

        setLocalUSer((prev) => ({
          ...prev,
          isBlocked: !prev.isBlocked,
        }));

        onClose(); 
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to block/unblock user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay with blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-96 max-w-full p-6 transform transition-transform duration-300 ease-out hover:scale-105 z-10">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-5 text-gray-800">{user.name}</h2>

        {/* User Details */}
        <div className="space-y-3 text-gray-700">
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p><span className="font-semibold">Role:</span> {user.role}</p>
          <p><span className="font-semibold">Verified:</span> {user.isVerified ? "Yes" : "No"}</p>
          <p><span className="font-semibold">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
          <p><span className="font-semibold">Last Login:</span> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}</p>
          <p><span className="font-semibold">Login Count:</span> {user.loginCount}</p>
          <p>
            <span className="font-semibold">Blocked:</span> 
            {localUser.isBlocked ? (
              <span className="text-red-600 font-semibold">yes</span>
            ) : (
              <span className="text-green-600 font-semibold">No</span>
            )
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleDeactivate}
            disabled={loading}
            className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            Deactivate
          </button>
          <button
            onClick={handleBlock}
            disabled={loading}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {localUser.isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </div>
    </div>
  );
}
