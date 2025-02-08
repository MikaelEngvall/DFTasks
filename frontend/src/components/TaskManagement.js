import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { FaEdit, FaTrash, FaPlus, FaComments } from "react-icons/fa";
import TaskForm from "./TaskForm";
import { useTheme } from "../context/ThemeContext";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";
import { useTaskTranslation } from "../hooks/useTaskTranslation";
import { jwtDecode } from "jwt-decode";

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
      const endpoint =
        userRole === "ADMIN"
          ? showInactive
            ? "/api/tasks/all"
            : "/api/tasks"
          : "/api/tasks/assigned";
      const response = await axiosInstance.get(endpoint);
      if (Array.isArray(response.data.tasks)) {
        const tasks = response.data.tasks.map((task) => ({
          ...task,
          dueDate:
            task.dueDate && task.dueDate !== "00.00.000Z" ? task.dueDate : null,
          assignedTo: task.assignedTo || null,
        }));

        const translatedTasks = await translateTasks(tasks);
        setTasks(translatedTasks);
      } else {
        setTasks([]);
      }
      setLoading(false);
    } catch (error) {
      setError(t("errorFetchingTasks"));
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/api/users");
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setUsers([]);
    }
  };

  const handleDelete = async (taskId, e) => {
    e?.stopPropagation();
    if (window.confirm(t("deleteConfirm"))) {
      try {
        await axiosInstance.delete(`/api/tasks/${taskId}`);
        await fetchTasks();
        setShowTaskDetails(false);
      } catch (error) {
        alert(t("errorDeactivatingTask"));
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
      setShowTaskDetails(true);
    } catch (error) {
      console.error("Error translating task:", error);
      setSelectedTask(task);
      setShowTaskDetails(true);
    }
  };

  const handleStatusUpdate = async (task) => {
    try {
      const response = await axiosInstance.put(
        `/api/tasks/${task._id}/status`,
        {
          status: editedStatus,
        }
      );

      if (response.data && response.data.task) {
        const translatedTask = await translateTask(response.data.task);
        setTasks(tasks.map((t) => (t._id === task._id ? translatedTask : t)));
        setSelectedTask(translatedTask);
        setEditedStatus(null);
      }
    } catch (error) {
      alert(t("errorUpdatingStatus"));
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (!taskData.title?.trim()) {
        alert(t("titleRequired"));
        return;
      }
      if (!taskData.description?.trim()) {
        alert(t("descriptionRequired"));
        return;
      }
      if (!taskData.dueDate) {
        alert(t("dueDateRequired"));
        return;
      }
      if (!taskData.status) {
        alert(t("statusRequired"));
        return;
      }

      if (selectedTask) {
        const response = await axiosInstance.put(
          `/api/tasks/${selectedTask._id}`,
          taskData
        );
        if (response.data && response.data.task) {
          const translatedTask = await translateTask(response.data.task);
          setTasks(
            tasks.map((task) =>
              task._id === selectedTask._id ? translatedTask : task
            )
          );
          setShowTaskForm(false);
          setSelectedTask(null);
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        const dueDateObj = new Date(taskData.dueDate);

        const taskDataToSend = {
          title: taskData.title.trim(),
          description: taskData.description.trim(),
          status: taskData.status,
          assignedTo: taskData.assignedTo || null,
          dueDate: dueDateObj.toISOString(),
        };

        const response = await axiosInstance.post("/api/tasks", taskDataToSend);
        if (response.data && response.data.task) {
          const translatedTask = await translateTask(response.data.task);
          setTasks([...tasks, translatedTask]);
          setShowTaskForm(false);
          setSelectedTask(null);
        } else {
          throw new Error("Invalid response format");
        }
      }
    } catch (error) {
      alert(t("errorSavingTask"));
    }
  };

  const getStatusClass = (status) => {
    if (!status || typeof status !== "string") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"; // default style
    }

    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "in progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "cannot fix":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await axiosInstance.post(
        `/api/tasks/${selectedTask._id}/comments`,
        { content: newComment }
      );
      if (response.data && response.data.task) {
        const translatedTask = await translateTask(response.data.task);
        setTasks(
          tasks.map((task) =>
            task._id === selectedTask._id ? translatedTask : task
          )
        );
        setSelectedTask(translatedTask);
        setNewComment("");
      }
    } catch (error) {
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

  const renderStatus = (status) => {
    if (!status || typeof status !== "string") {
      return t("pending");
    }
    try {
      return t(status.toLowerCase().replace(" ", ""));
    } catch (error) {
      return t("pending");
    }
  };

  const handleToggleTaskStatus = async (taskId, e) => {
    e?.stopPropagation();
    try {
      await axiosInstance.put(`/api/tasks/${taskId}/toggle`);
      await fetchTasks();
    } catch (error) {
      alert(t("errorTogglingTaskStatus"));
    }
  };

  const handleToggleCommentStatus = async (taskId, commentId) => {
    try {
      await axiosInstance.put(
        `/api/tasks/${taskId}/comments/${commentId}/toggle`
      );
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
          {userRole === "ADMIN" && (
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
        {userRole === "ADMIN" && (
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
                  {userRole === "ADMIN" && (
                    <>
                      <button
                        onClick={(e) => handleToggleTaskStatus(task._id, e)}
                        className={`mr-3 ${
                          task.isActive
                            ? "text-green-600 hover:text-green-900"
                            : "text-red-600 hover:text-red-900"
                        }`}
                        title={task.isActive ? t("deactivate") : t("activate")}
                      >
                        {task.isActive ? "✓" : "×"}
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

      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[45]">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 sticky top-0 bg-white dark:bg-gray-800 z-[46] pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-df-primary dark:text-white">
                  {selectedTask.title}
                </h2>
                <button
                  onClick={() => setShowTaskDetails(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-df-primary/70 dark:text-gray-400">
                      {t("description")}
                    </h3>
                    <p className="mt-1 text-df-primary dark:text-white whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-df-primary/70 dark:text-gray-400">
                      {t("status")}
                    </h3>
                    {userRole === "ADMIN" ||
                    selectedTask.assignedTo?._id === userId ? (
                      <div className="space-y-2">
                        <select
                          value={editedStatus || selectedTask.status}
                          onChange={(e) => setEditedStatus(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-df-primary dark:text-white"
                        >
                          <option value="pending">{t("pending")}</option>
                          <option value="in progress">{t("inProgress")}</option>
                          <option value="completed">{t("completed")}</option>
                          <option value="cannot fix">{t("cannotFix")}</option>
                        </select>
                        {editedStatus &&
                          editedStatus !== selectedTask.status && (
                            <button
                              onClick={() => handleStatusUpdate(selectedTask)}
                              className="w-full px-3 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90 transition-colors duration-150"
                            >
                              {t("save")}
                            </button>
                          )}
                      </div>
                    ) : (
                      <span
                        className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          selectedTask.status
                        )}`}
                      >
                        {renderStatus(selectedTask.status)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-df-primary/70 dark:text-gray-400">
                      {t("assignedTo")}
                    </h3>
                    <p className="mt-1 text-df-primary dark:text-white">
                      {selectedTask.assignedTo?.name || t("unassigned")}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-df-primary/70 dark:text-gray-400">
                      {t("deadline")}
                    </h3>
                    <p className="mt-1 text-df-primary dark:text-white">
                      {format(new Date(selectedTask.dueDate), "PPP")}
                    </p>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-6 md:pt-0 md:pl-6">
                  <h3 className="text-lg font-medium text-df-primary dark:text-white mb-4">
                    {t("comments")}
                  </h3>
                  <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                    {selectedTask.comments?.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                      >
                        <p className="text-df-primary dark:text-gray-100 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        <div className="mt-2 text-sm text-df-primary/70 dark:text-gray-400">
                          {comment.createdBy?.name || t("unassigned")} -{" "}
                          {format(
                            new Date(comment.createdAt),
                            "yyyy-MM-dd HH:mm"
                          )}
                        </div>
                      </div>
                    ))}
                    {(!selectedTask.comments ||
                      selectedTask.comments.length === 0) && (
                      <p className="text-df-primary/60 dark:text-gray-400 italic">
                        {t("noComments")}
                      </p>
                    )}
                  </div>

                  {(userRole === "ADMIN" ||
                    selectedTask.assignedTo?._id === userId) && (
                    <div className="mt-4">
                      <textarea
                        rows="3"
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-df-primary dark:text-white"
                        placeholder={t("writeComment")}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      ></textarea>
                      <button
                        onClick={handleAddComment}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
                      >
                        {t("addComment")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManagement;
