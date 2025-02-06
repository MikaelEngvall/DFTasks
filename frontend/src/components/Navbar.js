import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { FaSun, FaMoon } from "react-icons/fa";
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

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to={user ? "/dftasks/month-view" : "/dftasks"}
              className="text-xl font-bold text-df-primary dark:text-white"
            >
              DFTasks
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-df-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={darkMode ? t("lightMode") : t("darkMode")}
            >
              {darkMode ? (
                <FaSun className="h-5 w-5" />
              ) : (
                <FaMoon className="h-5 w-5" />
              )}
            </button>

            {user && (
              <>
                <Link
                  to="/dftasks/month-view"
                  className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300"
                >
                  {t("calendar")}
                </Link>
                <Link
                  to="/dftasks/dashboard"
                  className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300"
                >
                  {t("dashboard")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300"
                >
                  {t("logout")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
