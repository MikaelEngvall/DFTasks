import React, { useState } from "react";
import UserManagement from "./UserManagement";
import TaskManagement from "./TaskManagement";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";

function AdminDashboard() {
  const [activeView, setActiveView] = useState("tasks");
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen bg-df-light dark:bg-dark transition-colors duration-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <nav className="border-b border-gray-200 dark:border-gray-700 bg-df-primary/5 dark:bg-transparent">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center h-16">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveView("tasks")}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeView === "tasks"
                        ? "border-df-primary text-df-primary dark:border-df-accent dark:text-white"
                        : "border-transparent text-df-primary/60 hover:text-df-primary dark:text-gray-400 dark:hover:text-gray-300 hover:border-df-primary/30"
                    }`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setActiveView("users")}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeView === "users"
                        ? "border-df-primary text-df-primary dark:border-df-accent dark:text-white"
                        : "border-transparent text-df-primary/60 hover:text-df-primary dark:text-gray-400 dark:hover:text-gray-300 hover:border-df-primary/30"
                    }`}
                  >
                    Users
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <div className="p-4 sm:p-6 lg:p-8">
            {activeView === "tasks" ? <TaskManagement /> : <UserManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
