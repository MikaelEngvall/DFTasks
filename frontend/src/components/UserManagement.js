import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import UserModal from "./UserModal";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
  }, [showInactive]);

  const fetchUsers = async () => {
    try {
      const endpoint = showInactive ? "/api/users/all" : "/api/users";
      const response = await axiosInstance.get(endpoint);
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
      setLoading(false);
    } catch (error) {
      setError(t("errorFetchingUsers"));
      setLoading(false);
    }
  };

  const handleEdit = async (userData) => {
    try {
      const response = await axiosInstance.put(
        `/api/users/${selectedUser._id}`,
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
      alert(t("errorUpdatingUser"));
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await axiosInstance.put(`/api/users/${userId}/toggle`);
      await fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      alert(t("errorTogglingUserStatus"));
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
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
                onClick={() => handleUserClick(user)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  !user.isActive ? "opacity-50" : ""
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
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    }`}
                  >
                    {user.role}
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
    </div>
  );
}

export default UserManagement;
