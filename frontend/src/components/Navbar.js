import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  FaSun,
  FaMoon,
  FaTasks,
  FaClipboardList,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/dftasks/login");
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_4px_12px_0_rgba(0,0,0,0.5)] z-[60]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link
              to={user ? "/dftasks/month-view" : "/dftasks"}
              className="text-xl font-bold text-df-primary dark:text-white"
            >
              DFTasks
            </Link>

            <div className="scale-75 sm:scale-100">
              <LanguageSelector />
            </div>

            {user && isAdmin && (
              <div className="flex space-x-2 sm:space-x-6">
                <Link
                  to="/dftasks/month-view"
                  className="p-2 text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={t("tasks")}
                >
                  <FaTasks className="text-xl" />
                </Link>
                <Link
                  to="/dftasks/pending-tasks"
                  className="p-2 text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={t("pending.tasks")}
                >
                  <FaClipboardList className="text-xl" />
                </Link>
                <Link
                  to="/dftasks/users"
                  className="p-2 text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={t("users")}
                >
                  <FaUsers className="text-xl" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-df-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? t("light.mode") : t("dark.mode")}
            >
              {darkMode ? (
                <FaSun className="text-xl" />
              ) : (
                <FaMoon className="text-xl" />
              )}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="p-2 text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={t("logout")}
              >
                <FaSignOutAlt className="text-xl" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
