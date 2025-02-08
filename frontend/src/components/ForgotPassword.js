import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useTranslation } from "react-i18next";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email: email.toLowerCase().trim(),
      });
      setMessage(response.data.message || t("resetLinkSent"));
      setEmail("");
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-df-light dark:bg-dark px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <img
            src="/dftasks/dark_logo.png"
            alt="DFTasks Logo"
            className="hidden dark:block w-auto h-32 sm:h-[10.5rem] mb-6 sm:mb-8"
          />
          <img
            src="/dftasks/light_logo.png"
            alt="DFTasks Logo"
            className="dark:hidden w-auto h-32 sm:h-[10.5rem] mb-6 sm:mb-8"
          />
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-df-primary dark:text-white">
            {t("forgotPassword")}
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-df-primary/70 dark:text-gray-400">
            {t("resetPasswordInstructions")}
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-df-primary dark:text-white mb-1"
            >
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-df-primary dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-df-primary focus:border-df-primary sm:text-sm"
              placeholder={t("enterEmail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {message && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    {message}
                  </h3>
                </div>
              </div>
            </div>
          )}

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

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? t("sendingResetLink") : t("sendResetLink")}
            </button>

            <Link
              to="/dftasks/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-df-primary dark:text-white bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary transition-colors duration-150"
            >
              {t("backToLogin")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
