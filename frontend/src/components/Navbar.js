import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";

function Navbar() {
  const [user, setUser] = useState(null);
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/dftasks/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/dftasks"
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
                {user.role === "ADMIN" && (
                  <Link
                    to="/dftasks/admin"
                    className="text-df-primary dark:text-white hover:text-df-primary/80 dark:hover:text-gray-300"
                  >
                    {t("adminDashboard")}
                  </Link>
                )}
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
}

export default Navbar;
