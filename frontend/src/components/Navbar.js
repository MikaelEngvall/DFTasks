import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const isLoggedIn = localStorage.getItem("token");

  const handleLogout = () => {
    // Ta bort token från localStorage
    localStorage.removeItem("token");
    // Navigera till login-sidan
    navigate("/dftasks/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            to={isLoggedIn ? "/dftasks/week-view" : "/dftasks/login"}
            className="flex items-center"
          >
            <img
              src={
                process.env.PUBLIC_URL +
                (darkMode ? "/dark_logo.png" : "/light_logo.png")
              }
              alt="Duggals Fastigheter"
              className="h-12 w-auto"
            />
            <span className="ml-3 text-df-primary dark:text-white text-lg font-semibold">
              DFTasks
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm sm:text-base text-df-primary dark:text-white hover:text-df-accent"
              >
                <FaSignOutAlt className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
