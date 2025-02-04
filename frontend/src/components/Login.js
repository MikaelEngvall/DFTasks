import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Correct the import
import axiosInstance from "../utils/axios";
import { useTheme } from "../context/ThemeContext";

function Login() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      const decoded = jwtDecode(response.data.token);

      if (decoded.role === "ADMIN") {
        navigate("/dftasks/week-view");
      } else {
        navigate("/dftasks/week-view");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Ogiltiga inloggningsuppgifter");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-df-light dark:bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img
            src={
              process.env.PUBLIC_URL +
              (darkMode ? "/dark_logo.png" : "/light_logo.png")
            }
            alt="Duggals Fastigheter"
            className="h-20 w-auto mb-6"
          />
          <h2 className="text-center text-3xl font-bold text-df-primary dark:text-white">
            DFTasks
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Fastighetsförvaltning
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                E-postadress
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-df-secondary focus:border-df-secondary focus:z-10 sm:text-sm"
                placeholder="E-postadress"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Lösenord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-df-secondary focus:border-df-secondary focus:z-10 sm:text-sm"
                placeholder="Lösenord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-df-primary hover:bg-df-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-secondary dark:ring-offset-gray-800"
            >
              Logga in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
