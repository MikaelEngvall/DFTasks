import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axios";
import { FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import UserModal from "./UserModal";
import jwtDecode from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import PageHeader from "./PageHeader";
import CreateUserModal from "./CreateUserModal";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.role === "SUPERADMIN" || decoded.role === "ADMIN") {
        fetchUsers();
      } else {
        setError(t("accessDenied"));
      }
    } else {
      setError(t("accessDenied"));
    }
  }, [t]);

  const fetchUsers = useCallback(async () => {
    try {
      setError("");
      const endpoint = showInactive ? "/users/all" : "/users";
      console.log("Fetching users from endpoint:", endpoint);
      const response = await axiosInstance.get(endpoint);
      console.log("API response:", response.data);

      let userData = [];
      if (response.data && Array.isArray(response.data)) {
        userData = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        userData = response.data.users;
      } else if (response.data && Array.isArray(response.data.data)) {
        userData = response.data.data;
      }

      // Modifiera visningen av användarroller baserat på inloggad användares roll
      const processedUsers = userData.map((user) => ({
        ...user,
        displayRole:
          currentUser?.role === "SUPERADMIN"
            ? user.role
            : user.role === "SUPERADMIN"
            ? "ADMIN"
            : user.role,
      }));

      console.log("Processed user data:", processedUsers);
      setUsers(processedUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error.response || error);
      if (error.response?.status === 403) {
        setError(t("accessDenied"));
      } else {
        setError(t("errorFetchingUsers"));
      }
      setUsers([]);
      setLoading(false);
    }
  }, [t, showInactive, currentUser]);

  const handleEdit = async (userData) => {
    try {
      setError("");
      const response = await axiosInstance.put(
        `/users/${selectedUser._id}`,
        userData
      );
      if (response.data) {
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? response.data : user
          )
        );
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.status === 400) {
        alert(error.response.data.message || t("invalidData"));
      } else if (error.response?.status === 401) {
        alert(t("unauthorized"));
      } else if (error.response?.status === 403) {
        alert(t("notAuthorized"));
      } else if (error.response?.status === 409) {
        alert(t("emailAlreadyExists"));
      } else {
        alert(t("errorUpdatingUser"));
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setError("");
      await axiosInstance.patch(`/users/${userId}/toggle-status`);
      await fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error toggling user status:", error);
      setError(t("errorTogglingUserStatus"));
    }
  };

  const canToggleUserStatus = (targetUser) => {
    // Användare (USER) kan inte ändra status på någon
    if (currentUser?.role === "USER") return false;

    // Man kan inte ändra sin egen status
    if (targetUser._id === currentUser?.id) return false;

    // SUPERADMIN kan ändra status på alla utom sig själv
    if (currentUser?.role === "SUPERADMIN") return true;

    // ADMIN kan ändra status på alla utom SUPERADMIN och sig själv
    if (currentUser?.role === "ADMIN") {
      return targetUser.displayRole !== "SUPERADMIN";
    }

    return false;
  };

  const handleUserClick = (user) => {
    // Alla kan uppdatera sin egen profil
    if (user._id === currentUser?.id) {
      setSelectedUser(user);
      return;
    }

    // SUPERADMIN kan redigera alla utom sig själv
    if (currentUser?.role === "SUPERADMIN") {
      setSelectedUser(user);
      return;
    }

    // ADMIN kan redigera alla utom SUPERADMIN
    if (currentUser?.role === "ADMIN" && user.displayRole !== "SUPERADMIN") {
      setSelectedUser(user);
      return;
    }
  };

  const handleCreate = async (userData) => {
    try {
      setError("");
      await axiosInstance.post("/users", userData);
      await fetchUsers();
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating user:", error.response || error);
      alert(t("errorCreatingUser"));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, showInactive]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-df-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-df-light dark:bg-dark pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <PageHeader title={t("users")} />
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-df-primary text-white rounded-md hover:bg-df-primary/90 transition-colors duration-150"
            >
              {t("create.user")}
            </button>
          </div>

          <div className="mb-4 flex items-center">
            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-df-primary focus:ring-df-primary dark:border-gray-600 dark:bg-gray-700"
              />
              <span>{t("showInactive")}</span>
            </label>
          </div>

          {error ? (
            <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-200 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("email")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("role")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        {t("noUsers")}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        onClick={() => handleUserClick(user)}
                        className={`${
                          !user.isActive ? "opacity-50" : ""
                        } hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-df-primary dark:text-white">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-300">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.displayRole === "ADMIN"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                            }`}
                          >
                            {user.displayRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {user.isActive ? t("active") : t("inactive")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {canToggleUserStatus(user) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(user._id);
                              }}
                              className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80"
                            >
                              {user.isActive ? t("deactivate") : t("activate")}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {(selectedUser || isCreating) && (
            <UserModal
              user={selectedUser}
              onClose={() => {
                setSelectedUser(null);
                setIsCreating(false);
              }}
              onEdit={handleEdit}
              onSubmit={handleCreate}
              isCreating={isCreating}
            />
          )}

          {showCreateModal && (
            <CreateUserModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
