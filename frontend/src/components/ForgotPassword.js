import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "../hooks/useForm";
import { authAPI } from "../services/api";

function ForgotPassword() {
  const { t } = useTranslation();

  const handleForgotPassword = async (formData) => {
    await authAPI.forgotPassword(formData.email);
    // Visa success meddelande här
  };

  const { formData, handleChange, handleSubmit, errors } = useForm(
    {
      email: "",
    },
    handleForgotPassword
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-df-light dark:bg-dark px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 -mt-20">
        <div className="flex flex-col items-center">
          <img
            src="/dftasks/dark_logo.png"
            alt="DFTasks Logo"
            className="hidden dark:block w-auto h-40 sm:h-52 mb-2"
          />
          <img
            src="/dftasks/light_logo.png"
            alt="DFTasks Logo"
            className="dark:hidden w-auto h-40 sm:h-52 mb-2"
          />
        </div>

        <form
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="text-2xl font-bold text-df-primary dark:text-white mb-4">
              {t("forgotPassword")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("forgotPasswordInstructions")}
            </p>
          </div>

          <div className="space-y-4">
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
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {errors.general && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {errors.general}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary transition-colors duration-150"
            >
              {t("sendResetLink")}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/dftasks/login"
              className="font-medium text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80"
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
