import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import UserForm from "./UserForm";
import { useTranslation } from "react-i18next";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const { t } = useTranslation();

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(
        showInactive ? "/api/users/all" : "/api/users"
      );
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [showInactive]);

  const handleCreate = async (userData) => {
    try {
      const response = await axiosInstance.post("/api/users", userData);
      setUsers([...users, response.data]);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleEdit = async (userData) => {
    try {
      const response = await axiosInstance.put(
        `/api/users/${selectedUser._id}`,
        userData
      );
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? response.data : user
        )
      );
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm(t("deleteUserConfirm"))) {
      try {
        await axiosInstance.delete(`/api/users/${userId}`);
        await fetchUsers();
      } catch (error) {
        console.error("Error deactivating user:", error);
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await axiosInstance.put(`/api/users/${userId}/toggle`);
      await fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-df-primary dark:border-df-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-df-primary dark:text-white">
            {t("users")}
          </h1>
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
        <button
          onClick={() => setShowModal(true)}
          className="bg-df-primary text-white px-4 py-2 rounded-md hover:bg-df-dark transition-colors duration-150"
        >
          {t("newUser")}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-df-primary/10 dark:border-gray-700">
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
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className={`hover:bg-df-primary/5 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    !user.isActive ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-df-primary dark:text-white">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-df-primary/80 dark:text-gray-300">
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`${
                          user.isActive
                            ? "text-green-600 hover:text-green-900"
                            : "text-red-600 hover:text-red-900"
                        }`}
                        title={user.isActive ? t("deactivate") : t("activate")}
                      >
                        {user.isActive ? "✓" : "×"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="text-df-secondary hover:text-df-primary dark:text-df-accent dark:hover:text-white transition-colors duration-150"
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          onSubmit={selectedUser ? handleEdit : handleCreate}
        />
      )}
    </div>
  );
}

export default UserManagement;
