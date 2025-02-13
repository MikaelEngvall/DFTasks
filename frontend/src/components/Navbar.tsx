import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { tasksAPI } from "../services/api";
import LanguageSelector from "./LanguageSelector";
import { FaSun, FaMoon } from "react-icons/fa";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const fetchPendingTasksCount = async () => {
      try {
        const response = await tasksAPI.getTasks();
        const pendingTasks = response.data.filter(
          (task) => task.status === "pending"
        );
        setPendingTasksCount(pendingTasks.length);
      } catch (error) {
        console.error("Error fetching pending tasks:", error);
      }
    };

    if (user?.role === "ADMIN" || user?.role === "SUPERADMIN") {
      fetchPendingTasksCount();
    }
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    navigate("/dftasks/login");
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
    try {
      localStorage.setItem("theme", isDarkMode ? "light" : "dark");
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dftasks/month-view">
                <img
                  className="hidden dark:block h-12 w-auto"
                  src="/dftasks/dark_logo.png"
                  alt="DFTasks Logo"
                />
                <img
                  className="dark:hidden h-12 w-auto"
                  src="/dftasks/light_logo.png"
                  alt="DFTasks Logo"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dftasks/month-view"
                className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t("tasks")}
              </Link>
              {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
                <>
                  <Link
                    to="/dftasks/pending-tasks"
                    className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium relative"
                  >
                    {t("pending.tasks")}
                    {pendingTasksCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingTasksCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/dftasks/users"
                    className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {t("users")}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <button
              onClick={toggleDarkMode}
              className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300"
              title={isDarkMode ? t("light.mode") : t("dark.mode")}
            >
              {isDarkMode ? (
                <FaSun className="h-5 w-5" />
              ) : (
                <FaMoon className="h-5 w-5" />
              )}
            </button>
            <Link
              to="/dftasks/profile"
              className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t("profile")}
            </Link>
            <button
              onClick={handleLogout}
              className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 