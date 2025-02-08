import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";

function UserModal({ user, onClose, onEdit, onToggleStatus }) {
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedEmail, setEditedEmail] = useState(user?.email || "");
  const [editedRole, setEditedRole] = useState(user?.role || "USER");
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUserRole(decoded.role);
    }
  }, []);

  const handleSave = () => {
    onEdit({
      name: editedName,
      email: editedEmail,
      role: editedRole,
    });
    setIsEditing(false);
  };

  const getDisplayRole = (role) => {
    if (currentUserRole === "SUPERADMIN") {
      return role;
    }
    return role === "SUPERADMIN" ? "ADMIN" : role;
  };

  const canEditUser = () => {
    if (currentUserRole === "SUPERADMIN") return true;
    return user.role !== "SUPERADMIN";
  };

  return (
    <div className="fixed inset-0 z-[45] overflow-y-auto">
      <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
          <div className="sticky top-0 z-[46] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-df-primary dark:text-white">
                {user.name}
              </h3>
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
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-df-primary dark:text-white">
                  {t("name")}
                </h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-df-primary dark:text-white"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {user.name}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-df-primary dark:text-white">
                  {t("email")}
                </h4>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-df-primary dark:text-white"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {user.email}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-df-primary dark:text-white">
                  {t("role")}
                </h4>
                {isEditing && canEditUser() ? (
                  <select
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-df-primary dark:text-white"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    {currentUserRole === "SUPERADMIN" && (
                      <option value="SUPERADMIN">SUPERADMIN</option>
                    )}
                  </select>
                ) : (
                  <span
                    className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getDisplayRole(user.role) === "ADMIN"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    }`}
                  >
                    {getDisplayRole(user.role)}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-df-primary dark:text-white">
                  {t("status")}
                </h4>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {user.isActive ? t("active") : t("inactive")}
                  </span>
                  {canEditUser() && (
                    <button
                      onClick={() => onToggleStatus(user._id)}
                      className="text-sm text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80"
                    >
                      {user.isActive ? t("deactivate") : t("activate")}
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90"
                    >
                      {t("save")}
                    </button>
                  </>
                ) : (
                  canEditUser() && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90"
                    >
                      {t("edit")}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserModal;
