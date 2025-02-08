import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import TaskManagement from "./TaskManagement";
import UserManagement from "./UserManagement";
import PendingTasksManagement from "./PendingTasksManagement";
import { useTranslation } from "react-i18next";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);

  useEffect(() => {
    if (location.state?.view) {
      setActiveTab(location.state.view);
    }
  }, [location.state]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-df-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-df-light dark:bg-dark pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-df-primary dark:text-white">
              {t("welcome")}, {user.name}!
            </h1>
          </div>

          {(user.role === "ADMIN" || user.role === "SUPERADMIN") && (
            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className={`${
                      activeTab === "tasks"
                        ? "border-df-primary text-df-primary dark:border-df-accent dark:text-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors duration-150`}
                  >
                    {t("tasks")}
                  </button>
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`${
                      activeTab === "pending"
                        ? "border-df-primary text-df-primary dark:border-df-accent dark:text-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors duration-150`}
                  >
                    {t("pendingTasks")}
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`${
                      activeTab === "users"
                        ? "border-df-primary text-df-primary dark:border-df-accent dark:text-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors duration-150`}
                  >
                    {t("users")}
                  </button>
                </nav>
              </div>
            </div>
          )}

          <div className="mt-6">
            {activeTab === "tasks" && (
              <TaskManagement userRole={user.role} userId={user._id} />
            )}
            {activeTab === "pending" && <PendingTasksManagement />}
            {activeTab === "users" && <UserManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
