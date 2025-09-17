import { useEffect, useState } from "react";
import axios from "axios";
import UserProfileModal from "../../components/AdminDash/UserProfileModel";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5006/api/admin/user-list",
          { withCredentials: true }
        );
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <span className="text-green-500 font-medium">Active Members</span>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4 gap-3">
        <input
          type="text"
          placeholder="Search by name or email"
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="relative w-full sm:w-auto">
          <select className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Login At</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Login Count</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-100 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}</td>
                <td className="px-6 py-4">{user.loginCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewProfile(user)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-4 text-gray-500 space-x-2">
        <button className="px-3 py-1 rounded hover:bg-gray-100 transition">{"<"}</button>
        <button className="px-3 py-1 rounded bg-purple-600 text-white">1</button>
        <button className="px-3 py-1 rounded hover:bg-gray-100 transition">2</button>
        <button className="px-3 py-1 rounded hover:bg-gray-100 transition">3</button>
        <span className="px-2">...</span>
        <button className="px-3 py-1 rounded hover:bg-gray-100 transition">40</button>
        <button className="px-3 py-1 rounded hover:bg-gray-100 transition">{">"}</button>
      </div>

      {/* User Profile Modal */}
    <UserProfileModal
      user={selectedUser}
      isOpen={modalOpen}
      onClose={handleCloseModal}
      onUpdate={(updatedUser) => {
        // update parent state in real time
        setSelectedUser(updatedUser);
      }}/>
    </div>
  );
}
