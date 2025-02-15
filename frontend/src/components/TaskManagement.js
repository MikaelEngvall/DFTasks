import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axios";
import { FaEdit, FaTrash, FaPlus, FaComments } from "react-icons/fa";
import TaskForm from "./TaskForm";
import { useTheme } from "../context/ThemeContext";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";
import { useTaskTranslation } from "../hooks/useTaskTranslation";
import { jwtDecode } from "jwt-decode";
import TaskModal from "./TaskModal";
import { useTaskUtils } from "../utils/taskUtils";
import { tasksAPI } from "../services/api";
import TaskList from "./TaskList";

function TaskManagement({ userRole, userId }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { darkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [editedStatus, setEditedStatus] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const { translateTask, translateTasks, translateComments, currentLanguage } =
    useTaskTranslation();

  const { getStatusClass, renderStatus } = useTaskUtils();

  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";

  const getUserName = (assignedTo) => {
    if (!assignedTo) return t("unassigned");
    if (typeof assignedTo === "string") {
      const user = users.find((user) => user._id === assignedTo);
      return user ? user.name : t("unassigned");
    }
    return assignedTo.name || t("unassigned");
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/users");
      console.log("Raw user response:", response.data); // Debug
      let userData = [];
      if (response.data && Array.isArray(response.data)) {
        userData = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        userData = response.data.users;
      }
      const activeUsers = userData.filter(user => user.isActive);
      console.log("Active users:", activeUsers); // Debug
      setUsers(activeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const response = await (showInactive ? tasksAPI.getAllTasks() : tasksAPI.getTasks());
      const translatedTasks = await translateTasks(response.data);
      setTasks(translatedTasks);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(t("errorFetchingTasks"));
      setLoading(false);
    }
  }, [showInactive, translateTasks, t]);

  useEffect(() => {
    fetchTasks();
    fetchUsers(); // Hämta användare när komponenten laddas
  }, [fetchTasks, fetchUsers]);

  useEffect(() => {
    const updateSelectedTaskComments = async () => {
      if (selectedTask && selectedTask.comments?.length > 0) {
        const translatedTask = await translateTask(selectedTask);
        setSelectedTask(translatedTask);
      }
    };

    updateSelectedTaskComments();
  }, [currentLanguage, selectedTask?._id]);

  const handleDelete = async (taskId, e) => {
    e?.stopPropagation();
    if (window.confirm(t("deleteConfirm"))) {
      try {
        await axiosInstance.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter((task) => task._id !== taskId));
      } catch (error) {
        alert(t("errorDeletingTask"));
      }
    }
  };

  const handleEdit = (task, e) => {
    e?.stopPropagation(); // Förhindra att detaljvyn öppnas
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  const handleTaskClick = async (task) => {
    try {
      const translatedTask = await translateTask(task);
      setSelectedTask(translatedTask);
    } catch (error) {
      console.error("Error translating task:", error);
    }
  };

  const handleStatusUpdate = async (task) => {
    try {
      const response = await axiosInstance.put(`/tasks/${task._id}/status`, {
        status: editedStatus,
      });
      if (response.status === 200) {
        setTasks(
          tasks.map((t) =>
            t._id === task._id ? { ...t, status: editedStatus } : t
          )
        );
        setEditedStatus(null);
        setSelectedTask(response.data.task);
      }
    } catch (error) {
      alert(t("errorSavingTask"));
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      let response;
      if (selectedTask) {
        response = await axiosInstance.put(`/tasks/${selectedTask._id}`, taskData);
      } else {
        response = await axiosInstance.post("/tasks", taskData);
      }
      await fetchTasks(); // Uppdatera listan efter ändring
      setShowTaskForm(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
      setError(t("errorSavingTask"));
    }
  };

  const handleAddComment = async (taskId, commentText) => {
    if (!commentText.trim()) return;
    try {
      console.log("TaskManagement - Skickar kommentar till servern:", {
        taskId: taskId,
        content: commentText,
      });
      const response = await axiosInstance.post(`/tasks/${taskId}/comments`, {
        content: commentText,
      });
      if (response.data) {
        setSelectedTask(response.data.task);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-df-primary focus:ring-df-primary dark:border-gray-600 dark:bg-gray-700"
            />
            <span>{t("showArchived")}</span>
          </label>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setSelectedTask(null);
              setShowTaskForm(true);
            }}
            className="flex items-center px-4 py-2 bg-df-primary text-white rounded-md hover:bg-df-primary/90 transition-colors duration-150"
          >
            <FaPlus className="mr-2" />
            {t("newTask")}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <TaskList
        tasks={tasks}
        onTaskClick={(task) => setSelectedTask(task)}
        onEdit={(task) => {
          setSelectedTask(task);
          setShowTaskForm(true);
        }}
        showActions={true}
        isAdmin={isAdmin}
        getUserName={(assignedTo) => {
          if (!assignedTo) return t("unassigned");
          const user = users.find(u => u._id === assignedTo);
          return user ? user.name : t("unassigned");
        }}
      />

      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-df-primary dark:text-white mb-4">
              {selectedTask ? t("edit.task") : t("newTask")}
            </h2>
            <TaskForm
              onSubmit={handleTaskSubmit}
              onCancel={() => {
                setShowTaskForm(false);
                setSelectedTask(null);
              }}
              initialData={selectedTask}
              users={users}
            />
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={handleTaskSubmit}
          userRole={userRole}
          userId={userId}
          getStatusClass={getStatusClass}
          renderStatus={renderStatus}
          users={users}
        />
      )}
    </div>
  );
}

export default TaskManagement;