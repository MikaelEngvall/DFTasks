import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { useTaskTranslation } from "../hooks/useTaskTranslation";
import TaskModal from "./TaskModal";
import TaskForm from "./TaskForm";
import UserModal from "./UserModal";
import { tasksAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageHeader from "./PageHeader";

function MonthView() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentMonth] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const { user } = useAuth();

  const { translateTask, translateTasks, currentLanguage } =
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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/tasks?showArchived=${showArchived}`
      );
      if (!Array.isArray(response.data.tasks)) {
        setTasks([]);
      } else {
        const translatedTasks = await translateTasks(response.data.tasks);
        setTasks(translatedTasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [showArchived]);

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
    if (!task) return;
    try {
      const translatedTask = await translateTask(task);
      setSelectedTask(translatedTask);
    } catch (error) {
      console.error("Error translating task:", error);
      setSelectedTask(task);
    }
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowTaskForm(true);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await axiosInstance.post("/tasks", {
        ...taskData,
        dueDate: selectedDate,
      });
      await fetchTasks();
      setShowTaskForm(false);
      setSelectedDate(null);
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  };

  const handleCancelTaskForm = () => {
    setShowTaskForm(false);
    setSelectedDate(null);
  };

  const handleArchiveTask = async (taskId) => {
    try {
      await tasksAPI.toggleTaskStatus(taskId, true);
      fetchTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error("Error archiving task:", error);
    }
  };

  const canEditTask = (task) => {
    if (!currentUser || !task) return false;
    return (
      currentUser.role === "ADMIN" ||
      currentUser.role === "SUPERADMIN" ||
      task.assignedTo?._id === currentUser.id
    );
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

  const handleStatusUpdate = async (task, newStatus) => {
    try {
      console.log("Updating task status:", {
        taskId: task._id,
        currentStatus: task.status,
        newStatus: newStatus,
      });

      const response = await tasksAPI.updateTaskStatus(task._id, newStatus);

      if (response.data) {
        const updatedTask = response.data;
        setTasks(tasks.map((t) => (t._id === task._id ? updatedTask : t)));
        setSelectedTask(updatedTask);
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

  const handleAddComment = async (taskId, commentText) => {
    if (!commentText.trim()) return;
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/comments`, {
        content: commentText,
      });
      if (response.data && response.data.task) {
        const translatedTask = await translateTask(response.data.task);
        setTasks(
          tasks.map((task) => (task._id === taskId ? translatedTask : task))
        );
        setSelectedTask(translatedTask);
      }
    } catch (error) {
      alert(t("errorAddingComment"));
    }
  };

  const getMonthName = (date) => {
    const monthIndex = date.getMonth();
    const months = [
      "months.january",
      "months.february",
      "months.march",
      "months.april",
      "months.may",
      "months.june",
      "months.july",
      "months.august",
      "months.september",
      "months.october",
      "months.november",
      "months.december",
    ];
    return t(months[monthIndex]);
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
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <PageHeader title={t("tasks")} />
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-df-primary rounded border-gray-300 focus:ring-df-primary"
                />
                <span className="text-sm text-df-primary dark:text-white">
                  {t("showArchived")}
                </span>
              </label>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-xl font-semibold text-df-primary dark:text-white">
                {`${getMonthName(currentMonth)} ${currentMonth.getFullYear()}`}
              </h2>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
              {weekDays[i18n.language].map((day) => (
                <div key={day} className="bg-white dark:bg-gray-800 p-2">
                  <h3 className="text-sm font-medium text-df-primary dark:text-white">
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
                    className="bg-white dark:bg-gray-800 p-4 min-h-[120px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        handleDayClick(date);
                      }
                    }}
                  >
                    <p className="text-sm text-df-primary/70 dark:text-gray-400">
                      {index + 1}
                    </p>
                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <div
                          key={task._id}
                          className={`p-2 rounded-lg ${
                            canEditTask(task)
                              ? "bg-df-primary/10 dark:bg-gray-700 hover:bg-df-primary/20 dark:hover:bg-gray-600"
                              : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                          } cursor-pointer transition-colors duration-150 ${
                            !task.isActive ? "opacity-50" : ""
                          }`}
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
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusUpdate={handleStatusUpdate}
          onAddComment={handleAddComment}
          onArchive={handleArchiveTask}
          userRole={currentUser.role}
          userId={currentUser.id}
          getStatusClass={getStatusClass}
          renderStatus={renderStatus}
        />
      )}

      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-df-primary dark:text-white mb-4">
              {t("newTask")}
            </h2>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={handleCancelTaskForm}
              users={users}
            />
          </div>
        </div>
      )}

      {showUserModal && (
        <UserModal user={user} onClose={() => setShowUserModal(false)} />
      )}
    </div>
  );
}

export default MonthView;
