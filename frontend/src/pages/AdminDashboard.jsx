import { useState } from "react";
import Sidebar from "../components/AdminDash/SideBar.jsx";
import AdminUsers from "../components/AdminDash/UserList.jsx";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("users"); // Track which section is active

  return (
    <div className="flex h-screen">
      {/* Sidebar: pass activeSection state to control which section is displayed */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {activeSection === "users" && <AdminUsers />}
        {/* Future sections can be added here */}
        {/* {activeSection === "posts" && <AdminPosts />} */}
        {/* {activeSection === "settings" && <AdminSettings />} */}
      </div>
    </div>
  );
}
