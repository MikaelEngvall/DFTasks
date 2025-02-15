import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../utils/axios";
import { format } from "date-fns";
import PendingTaskModal from "./PendingTaskModal";
import { useAuth } from "../context/AuthContext";
import PageHeader from "./PageHeader";
import PendingTaskList from "./PendingTaskList";

function PendingTasksManagement() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className="min-h-screen bg-df-light dark:bg-dark pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("pending.tasks")}
            </h1>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center">{t("loading")}</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">{t("noPendingTasks")}</div>
            ) : (
              <PendingTaskList tasks={pendingTasks} onTaskClick={handleTaskClick} />
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
