import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });
      login(response.data.token);
      navigate("/dftasks/month-view");
    } catch (error) {
      setError(error.response?.data?.message || t("error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-df-light dark:bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            src="/dftasks/dark_logo.png"
            alt="DFTasks Logo"
            className="hidden dark:block w-auto h-[10.5rem] mx-auto mb-8"
          />
          <img
            src="/dftasks/light_logo.png"
            alt="DFTasks Logo"
            className="dark:hidden w-auto h-[10.5rem] mx-auto mb-8"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-df-primary dark:text-white">
            DFTasks
          </h2>
          <p className="mt-2 text-center text-sm text-df-primary/70 dark:text-gray-400">
            {t("propertyManagement")}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-df-primary dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-df-primary focus:border-df-primary focus:z-10 sm:text-sm"
                placeholder={t("enterEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-df-primary dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-df-primary focus:border-df-primary focus:z-10 sm:text-sm"
                placeholder={t("enterPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary transition-colors duration-150"
            >
              {t("login")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
