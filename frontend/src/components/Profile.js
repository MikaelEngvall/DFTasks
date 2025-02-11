import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../utils/api";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPreferredLanguage(user.preferredLanguage || "en");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfile({
        name,
        email,
        preferredLanguage,
      });

      if (response.status) {
        updateUser(response.user);
        setMessage(t("profileUpdated"));
      }
    } catch (error) {
      setMessage(t("errorUpdatingProfile"));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage(t("passwordsDoNotMatch"));
      return;
    }
    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      if (response.status) {
        setPasswordMessage(t("passwordUpdated"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setPasswordMessage(t("errorUpdatingPassword"));
    }
  };

  return (
    <div className="min-h-screen bg-df-light dark:bg-dark pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-df-primary dark:text-white mb-6">
            {t("profile")}
          </h2>
          {message && (
            <div className="mb-6 p-3 rounded-lg bg-df-primary/10 dark:bg-df-primary/20 text-df-primary dark:text-white">
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-df-primary dark:text-white mb-1">
                {t("name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-df-primary dark:text-white focus:ring-df-primary focus:border-df-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-df-primary dark:text-white mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-df-primary dark:text-white focus:ring-df-primary focus:border-df-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-df-primary dark:text-white mb-1">
                {t("preferredLanguage")}
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-df-primary dark:text-white focus:ring-df-primary focus:border-df-primary"
              >
                <option value="sv">{t("swedish")}</option>
                <option value="pl">{t("polish")}</option>
                <option value="uk">{t("ukrainian")}</option>
                <option value="en">{t("english")}</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md bg-df-primary hover:bg-df-primary/90 text-white font-medium transition-colors duration-150"
            >
              {t("updateProfile")}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-df-primary dark:text-white mb-6">
              {t("changePassword")}
            </h3>
            {passwordMessage && (
              <div className="mb-6 p-3 rounded-lg bg-df-primary/10 dark:bg-df-primary/20 text-df-primary dark:text-white">
                {passwordMessage}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-df-primary dark:text-white mb-1">
                  {t("currentPassword")}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-df-primary dark:text-white focus:ring-df-primary focus:border-df-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-df-primary dark:text-white mb-1">
                  {t("newPassword")}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-df-primary dark:text-white focus:ring-df-primary focus:border-df-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-df-primary dark:text-white mb-1">
                  {t("confirmNewPassword")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-df-primary dark:text-white focus:ring-df-primary focus:border-df-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-df-primary hover:bg-df-primary/90 text-white font-medium transition-colors duration-150"
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
