import React, { useState } from "react";
import UserManagement from "./UserManagement";
import TaskManagement from "./TaskManagement";
import Navbar from "./Navbar";

function AdminDashboard() {
  const [activeView, setActiveView] = useState("users");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={() => setActiveView("users")}
                className={`inline-flex items-center px-4 py-2 border-b-2 ${
                  activeView === "users"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveView("tasks")}
                className={`ml-8 inline-flex items-center px-4 py-2 border-b-2 ${
                  activeView === "tasks"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tasks
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeView === "users" ? <UserManagement /> : <TaskManagement />}
      </main>
    </div>
  );
}

export default AdminDashboard;
