import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleLogout = () => {
    // Ta bort token från localStorage
    localStorage.removeItem("token");
    // Navigera till login-sidan
    navigate("/login");
  };

  return (
    <nav className="bg-df-primary dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <img
              src={
                process.env.PUBLIC_URL +
                (darkMode ? "/dark_logo.png" : "/light_logo.png")
              }
              alt="Duggals Fastigheter"
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm sm:text-base text-white hover:text-df-accent"
            >
              <FaSignOutAlt className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logga ut</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
