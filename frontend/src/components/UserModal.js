import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../utils/axios";

function UserModal({ user, onClose }) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { t } = useTranslation();

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.patch("/users/profile", {
        name,
        email,
      });
      setSuccess(t("profileUpdated"));
    } catch (error) {
      setError(error.response?.data?.message || t("error"));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    try {
      await axiosInstance.patch("/users/password", {
        currentPassword,
        newPassword,
      });
      setSuccess(t("passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.response?.data?.message || t("error"));
    }
  };

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto">
      <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-df-primary dark:text-white">
                {t("userSettings")}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">{t("close")}</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="mb-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-df-primary dark:text-white"
                  >
                    {t("name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-df-primary dark:text-white"
                  >
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
                >
                  {t("updateProfile")}
                </button>
              </div>
            </form>

            <form onSubmit={handlePasswordUpdate}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-df-primary dark:text-white"
                  >
                    {t("currentPassword")}
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-df-primary dark:text-white"
                  >
                    {t("newPassword")}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-df-primary dark:text-white"
                  >
                    {t("confirmPassword")}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
                >
                  {t("updatePassword")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserModal;
