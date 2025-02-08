import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../utils/axios";
import { format } from "date-fns";
import PendingTaskModal from "./PendingTaskModal";
import { useAuth } from "../context/AuthContext";

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
      console.log("Fetching pending tasks...");
      const response = await axiosInstance.get("/tasks/pending");
      console.log("Response:", response.data);

      const taskData = response.data.pendingTasks || [];
      console.log("Processed task data:", taskData);
      setPendingTasks(taskData);
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

  if (error) {
    return (
      <div className="p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-df-primary dark:text-white">
        {t("pendingTasks")}
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("title")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("reporter")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("receivedAt")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {pendingTasks.map((task) => (
              <tr key={task._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-df-primary dark:text-white">
                    {task.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {task.reporterName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {task.reporterEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {format(new Date(task.createdAt), "yyyy-MM-dd HH:mm")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80"
                  >
                    {t("review")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <PendingTaskModal
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onApprove={handleApprove}
        />
      )}
    </div>
  );
}

export default PendingTasksManagement;
