import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [currentLanguage, showInactive]);

  useEffect(() => {
    const updateSelectedTaskComments = async () => {
      if (selectedTask && selectedTask.comments?.length > 0) {
        const translatedTask = await translateTask(selectedTask);
        setSelectedTask(translatedTask);
      }
    };

    updateSelectedTaskComments();
  }, [currentLanguage, selectedTask?._id]);

  const fetchTasks = async () => {
    try {
      setError(null);
      const response = await (showInactive
        ? tasksAPI.getAllTasks()
        : tasksAPI.getTasks());

      let taskData = [];
      if (response.data && Array.isArray(response.data.tasks)) {
        taskData = response.data.tasks;
      } else if (response.data && Array.isArray(response.data)) {
        taskData = response.data;
      }

      const translatedTasks = await translateTasks(taskData);
      setTasks(translatedTasks || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(t("errorFetchingTasks"));
      setTasks([]);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

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
        response = await axiosInstance.put(
          `/tasks/${selectedTask._id}`,
          taskData
        );
      } else {
        response = await axiosInstance.post("/tasks", taskData);
      }

      if (response.data) {
        const translatedTask = await translateTask(response.data.task);
        if (selectedTask) {
          setTasks(
            tasks.map((task) =>
              task._id === selectedTask._id ? translatedTask : task
            )
          );
        } else {
          setTasks([...tasks, translatedTask]);
        }
        setShowTaskForm(false);
        setSelectedTask(null);
      }
    } catch (error) {
      alert(t("errorSavingTask"));
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
      console.log("TaskManagement - Svar från servern:", response.data);
      if (response.data && response.data.task) {
        const translatedTask = await translateTask(response.data.task);
        setTasks(
          tasks.map((task) => (task._id === taskId ? translatedTask : task))
        );
        setSelectedTask(translatedTask);
      }
    } catch (error) {
      console.error(
        "TaskManagement - Fel vid tillägg av kommentar:",
        error.response || error
      );
      alert(t("errorAddingComment"));
    }
  };

  const formatDate = (dateString, formatStr = "yyyy-MM-dd") => {
    if (!dateString || dateString === "00.00.000Z") return t("noDate");
    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        return t("noDate");
      }
      return format(date, formatStr);
    } catch (error) {
      return t("noDate");
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus, e) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      await tasksAPI.toggleTaskStatus(taskId, currentStatus);
      await fetchTasks();
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };

  const handleToggleCommentStatus = async (taskId, commentId) => {
    try {
      await axiosInstance.put(`/tasks/${taskId}/comments/${commentId}/toggle`);
      await fetchTasks();
      const updatedTask = tasks.find((t) => t._id === taskId);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      alert(t("errorTogglingCommentStatus"));
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
            {t("tasks")}
          </h2>
          {isAdmin && (
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
          )}
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("title")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("description")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("assignedTo")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("deadline")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <tr
                key={task._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  !task.isActive ? "opacity-50" : ""
                }`}
                onClick={() => handleTaskClick(task)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm font-medium text-df-primary dark:text-white">
                    {task.title}
                    {task.comments?.length > 0 && (
                      <FaComments className="ml-2 text-df-primary/60 dark:text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">
                    {task.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      task.status
                    )}`}
                  >
                    {renderStatus(task.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {getUserName(task.assignedTo)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {formatDate(task.dueDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isAdmin && (
                    <>
                      <button
                        onClick={(e) =>
                          handleToggleTaskStatus(task._id, task.isActive, e)
                        }
                        className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80"
                      >
                        {task.isActive ? t("deactivate") : t("activate")}
                      </button>
                      <button
                        onClick={(e) => handleEdit(task, e)}
                        className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80 mr-3"
                        title={t("edit")}
                      >
                        <FaEdit className="inline-block" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <TaskForm
              task={selectedTask}
              users={users}
              onSubmit={handleTaskSubmit}
              onCancel={() => {
                setShowTaskForm(false);
                setSelectedTask(null);
              }}
            />
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusUpdate={handleStatusUpdate}
          onAddComment={handleAddComment}
          userRole={userRole}
          userId={userId}
          getStatusClass={getStatusClass}
          renderStatus={renderStatus}
        />
      )}
    </div>
  );
}

export default TaskManagement;
