import React, { useState } from "react";
import UserManagement from "./UserManagement";
import TaskManagement from "./TaskManagement";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("tasks");
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen bg-df-light dark:bg-dark pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`${
                  activeTab === "tasks"
                    ? "border-df-primary text-df-primary dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
              >
                Uppgifter
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`${
                  activeTab === "users"
                    ? "border-df-primary text-df-primary dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
              >
                Användare
              </button>
            </nav>
          </div>

          {activeTab === "tasks" ? <TaskManagement /> : <UserManagement />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
