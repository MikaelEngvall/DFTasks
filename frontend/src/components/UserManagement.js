import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import UserModal from "./UserModal";
import { jwtDecode } from "jwt-decode";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { t } = useTranslation();
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUserRole(decoded.role);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [showInactive]);

  const fetchUsers = async () => {
    try {
      setError(null);
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
          currentUserRole === "SUPERADMIN"
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
      setError(t("errorFetchingUsers"));
      setUsers([]);
      setLoading(false);
    }
  };

  const handleEdit = async (userData) => {
    try {
      const response = await axiosInstance.patch(
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
      await axiosInstance.put(`/users/${userId}/toggle`);
      await fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      alert(t("errorTogglingUserStatus"));
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleCreate = async (userData) => {
    try {
      const response = await axiosInstance.post("/users", userData);
      if (response.data) {
        await fetchUsers();
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating user:", error.response || error);
      alert(t("errorCreatingUser"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-df-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-df-primary dark:text-white">
            {t("users")}
          </h2>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="form-checkbox h-4 w-4 text-df-primary"
            />
            <span className="text-sm text-df-primary dark:text-white">
              {t("showInactive")}
            </span>
          </label>
        </div>
        {currentUserRole === "SUPERADMIN" && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
          >
            <FaPlus className="mr-2" />
            {t("newUser")}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("email")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("role")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("status")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr
                key={user._id}
                onClick={() =>
                  currentUserRole === "SUPERADMIN" || user.role !== "SUPERADMIN"
                    ? handleUserClick(user)
                    : null
                }
                className={`${!user.isActive ? "opacity-50" : ""} ${
                  currentUserRole === "SUPERADMIN" || user.role !== "SUPERADMIN"
                    ? "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    : "cursor-default"
                }`}
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
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {user.isActive ? t("active") : t("inactive")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {isCreating && (
        <UserModal
          isCreating={true}
          onClose={() => setIsCreating(false)}
          onEdit={handleCreate}
        />
      )}
    </div>
  );
}

export default UserManagement;
