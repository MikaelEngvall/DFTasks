import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTaskTranslation } from "../hooks/useTaskTranslation";

function MonthView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [editedStatus, setEditedStatus] = useState(null);
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { translateTask, translateTasks, translateComments, currentLanguage } =
    useTaskTranslation();

  const weekDays = {
    en: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    sv: ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"],
    pl: [
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
      "Niedziela",
    ],
    uk: [
      "Понеділок",
      "Вівторок",
      "Середа",
      "Четвер",
      "П'ятниця",
      "Субота",
      "Неділя",
    ],
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded);
    }
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/api/tasks");
        if (!Array.isArray(response.data.tasks)) {
          setTasks([]);
        } else {
          const translatedTasks = await translateTasks(response.data.tasks);
          setTasks(translatedTasks || []);
        }
      } catch (error) {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentLanguage]);

  useEffect(() => {
    const updateSelectedTaskComments = async () => {
      if (selectedTask && selectedTask.comments?.length > 0) {
        const translatedTask = await translateTask(selectedTask);
        setSelectedTask(translatedTask);
      }
    };

    updateSelectedTaskComments();
  }, [currentLanguage, selectedTask?._id]);

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

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "in progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "cannot fix":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    }
  };

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const handleEditTask = async () => {
    try {
      const response = await axiosInstance.put(
        `/api/tasks/${editedTask._id}`,
        editedTask
      );
      if (response.status === 200) {
        setTasks(
          tasks.map((task) =>
            task._id === editedTask._id ? response.data.task : task
          )
        );
        setIsEditing(false);
        setSelectedTask(response.data.task);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert(t("errorSavingTask"));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm(t("deleteConfirm"))) {
      try {
        await axiosInstance.delete(`/api/tasks/${taskId}`);
        setTasks(tasks.filter((task) => task._id !== taskId));
        setSelectedTask(null);
      } catch (error) {
        console.error("Error deleting task:", error);
        alert(t("errorDeletingTask"));
      }
    }
  };

  const startEditing = (task) => {
    setEditedTask({ ...task });
    setIsEditing(true);
  };

  const handleStatusUpdate = async (task) => {
    try {
      const response = await axiosInstance.put(
        `/api/tasks/${task._id}/status`,
        { status: editedStatus }
      );
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
      console.error("Error updating task status:", error);
      alert(t("errorSavingTask"));
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "completed":
        return t("completed");
      case "in progress":
        return t("inProgress");
      case "cannot fix":
        return t("cannotFix");
      default:
        return t("pending");
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

  const handleEdit = (task) => {
    navigate("/dftasks/dashboard", {
      state: {
        selectedTaskId: task._id,
        view: "tasks",
      },
    });
  };

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-df-primary dark:text-white p-4">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {weekDays[i18n.language].map((day) => (
              <div key={day} className="bg-white dark:bg-gray-800 p-2">
                <h3 className="text-sm font-semibold text-df-primary dark:text-white">
                  {day}
                </h3>
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth - 1 }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-white dark:bg-gray-800 p-4 min-h-[120px]"
              />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                index + 1
              );
              const dayTasks = tasks.filter(
                (task) =>
                  format(new Date(task.dueDate), "yyyy-MM-dd") ===
                  format(date, "yyyy-MM-dd")
              );

              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 min-h-[120px]"
                >
                  <p className="text-sm text-df-primary/70 dark:text-gray-400">
                    {index + 1}
                  </p>
                  <div className="mt-2 space-y-2">
                    {dayTasks.map((task) => (
                      <div
                        key={task._id}
                        className={`p-2 rounded-lg ${
                          task.assignedTo?._id === currentUser?.id
                            ? "bg-df-primary/10 dark:bg-gray-700 hover:bg-df-primary/20 dark:hover:bg-gray-600"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        } cursor-pointer transition-colors duration-150`}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="text-sm font-medium text-df-primary dark:text-white truncate">
                          {task.title}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span
                            className={`px-2 text-xs font-semibold rounded-full ${getStatusClass(
                              task.status
                            )}`}
                          >
                            {renderStatus(task.status)}
                          </span>
                          <span className="text-xs text-df-primary/70 dark:text-gray-400">
                            {task.assignedTo?.name || t("unassigned")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-[101]">
              <h2 className="text-xl font-semibold text-df-primary dark:text-white">
                {selectedTask.title}
              </h2>
              <button
                onClick={() => {
                  setShowTaskDetails(false);
                  setSelectedTask(null);
                  setEditedStatus(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
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
                    {currentUser.role === "ADMIN" ||
                    selectedTask.assignedTo?._id === currentUser.id ? (
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

                  {(currentUser.role === "ADMIN" ||
                    selectedTask.assignedTo?._id === currentUser.id) && (
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

export default MonthView;
