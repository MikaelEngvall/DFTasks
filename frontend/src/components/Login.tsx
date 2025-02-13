import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);
      login(response.data.token);
      navigate("/dftasks/month-view");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || t("loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-df-primary dark:text-white mb-4">
              {t("login")}
            </h2>
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
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-df-primary dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-df-primary focus:border-df-primary sm:text-sm"
                placeholder={t("enterEmail")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-df-primary dark:text-white mb-1"
              >
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-df-primary dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-df-primary focus:border-df-primary sm:text-sm"
                placeholder={t("enterPassword")}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("loggingIn") : t("login")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 