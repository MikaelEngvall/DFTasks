import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../utils/api";
import toast from "react-hot-toast";

interface ProfileFormData {
  name: string;
  email: string;
  preferredLanguage: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || "",
    email: user?.email || "",
    preferredLanguage: user?.preferredLanguage || "en",
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await updateProfile(formData);
      updateUser(response.user);
      toast.success(t("profileUpdated"));
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || t("errorUpdatingProfile")
      );
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success(t("passwordUpdated"));
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(
        error.response?.data?.message || t("errorUpdatingPassword")
      );
    }
  };

  return (
    <div className="min-h-screen bg-df-light dark:bg-dark pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-df-primary dark:text-white mb-6">
            {t("profile.settings")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-medium text-df-primary dark:text-white">
                {t("updateProfile")}
              </h3>

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
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
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
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="preferredLanguage"
                  className="block text-sm font-medium text-df-primary dark:text-white"
                >
                  {t("preferredLanguage")}
                </label>
                <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredLanguage: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="sv">{t("swedish")}</option>
                  <option value="en">{t("english")}</option>
                  <option value="pl">{t("polish")}</option>
                  <option value="uk">{t("ukrainian")}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
              >
                {t("save")}
              </button>
            </form>

            {/* Password Change Form */}
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <h3 className="text-lg font-medium text-df-primary dark:text-white">
                {t("changePassword")}
              </h3>

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
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
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
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-df-primary dark:text-white"
                >
                  {t("confirmNewPassword")}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
              >
                {t("updatePassword")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 