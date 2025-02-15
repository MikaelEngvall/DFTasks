import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../utils/axios";
import { format } from "date-fns";
import PendingTaskModal from "./PendingTaskModal";
import { useAuth } from "../context/AuthContext";
import PageHeader from "./PageHeader";

function PendingTasksManagement() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const { user } = useAuth();

  const fetchPendingTasks = useCallback(async () => {
    try {
      setError("");
      const response = await axiosInstance.get("/tasks/pending");
      setPendingTasks(response.data.pendingTasks || []);
    } catch (error) {
      console.error("Error fetching pending tasks:", error.response || error);
      if (error.response?.status === 403) {
        setError(t("accessDenied"));
      } else if (error.response?.status === 400) {
        setError(t("invalidRequest"));
      } else {
        setError(t("errorFetchingTasks"));
      }
      setPendingTasks([]);
    }
  }, [t]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "SUPERADMIN") {
      fetchPendingTasks();
      fetchUsers();
    } else {
      setError(t("accessDenied"));
    }
  }, [user, fetchPendingTasks, fetchUsers, t]);

  const handleApprove = async (taskId, data) => {
    try {
      setError("");
      await axiosInstance.post(`/tasks/pending/${taskId}/approve`, data);
      fetchPendingTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error("Error approving task:", error);
      if (error.response?.status === 403) {
        setError(t("accessDenied"));
      } else {
        setError(t("errorApprovingTask"));
      }
    }
  };

  const handleDecline = async (taskId, data) => {
    try {
      setError("");
      await axiosInstance.post(`/tasks/pending/${taskId}/decline`, data);
      fetchPendingTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error("Error declining task:", error);
      if (error.response?.status === 403) {
        setError(t("accessDenied"));
      } else {
        setError(t("errorDecliningTask"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-df-light dark:bg-dark">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              {t("pendingTasks")}
            </h2>
          </div>

          <div className="p-6">
            {error ? (
              <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-200 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">{t("noPendingTasks")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("title")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("anmalare")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("mottagetDatum")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pendingTasks.map((task) => (
                      <tr
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {task.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {task.reporterName}
                          <br />
                          {task.reporterEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTask && (
        <PendingTaskModal
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onApprove={handleApprove}
          onDecline={handleDecline}
        />
      )}
    </div>
  );
}

export default PendingTasksManagement;
