import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useTranslation } from "react-i18next";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/api/auth/reset-password", {
        token,
        password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/dftasks/login");
      }, 3000);
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
            {t("resetPassword")}
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-df-primary/70 dark:text-gray-400">
            {t("enterNewPassword")}
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-df-primary dark:text-white mb-1"
              >
                {t("newPassword")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-df-primary dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-df-primary focus:border-df-primary sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || success}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-df-primary dark:text-white mb-1"
              >
                {t("confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-df-primary dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-df-primary focus:border-df-primary sm:text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || success}
              />
            </div>
          </div>

          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    {t("resetPasswordSuccess")}
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

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || success}
            >
              {isLoading ? t("resettingPassword") : t("resetPassword")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
