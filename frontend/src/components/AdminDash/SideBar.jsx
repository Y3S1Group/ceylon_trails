import { useState } from "react";
import { Image, Users, Settings, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth"; 

export default function Sidebar({activeSection, setActiveSection}) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoggedIn, logout } = useAuth(); 

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from useAuth
      // Optionally, redirect or update state after logout
      window.location.href = '/'; // Redirect to explore page
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  return (
    <div
      className={`h-screen ${collapsed ? "w-20" : "w-64"} bg-gray-900 text-gray-100 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <span className="text-xl font-bold">Admin Panel</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setActiveSection("users")}
          className={`flex items-center gap-3 p-2 rounded-lg w-full text-left 
            ${activeSection === "users" ? "bg-gray-800 text-white" : "hover:bg-gray-800"}`}
        >
          <Users size={20} />
          {!collapsed && <span>Users</span>}
        </button>

        <button
          onClick={() => setActiveSection("posts")}
          className={`flex items-center gap-3 p-2 rounded-lg w-full text-left 
            ${activeSection === "posts" ? "bg-gray-800 text-white" : "hover:bg-gray-800"}`}
        >
          <Image size={20} />
          {!collapsed && <span>Posts</span>}
        </button>
      </nav>


      {/* Footer / Admin Details */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        {collapsed ? (
          <div className="text-center">👤</div>
        ) : isLoggedIn && user ? (
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <p className="text-xs">Not logged in</p>
        )}
      </div>
    </div>
  );
}
