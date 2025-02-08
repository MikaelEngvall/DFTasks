import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { format, startOfWeek, addDays } from "date-fns";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaExclamationCircle,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import TaskModal from "./TaskModal";
import { useTaskTranslation } from "../hooks/useTaskTranslation";

function WeekView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { translateTask } = useTaskTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded);
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get("/api/tasks");
      if (!Array.isArray(response.data.tasks)) {
        console.error("Tasks is not an array:", response.data.tasks);
        setTasks([]);
      } else {
        setTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskClick = async (task) => {
    try {
      const translatedTask = await translateTask(task);
      setSelectedTask(translatedTask);
    } catch (error) {
      console.error("Error translating task:", error);
    }
  };

  const handleStatusUpdate = async (task, newStatus) => {
    try {
      const response = await axiosInstance.put(`/tasks/${task._id}/status`, {
        status: newStatus,
      });
      if (response.status === 200) {
        setTasks(
          tasks.map((t) => (t._id === task._id ? response.data.task : t))
        );
        setSelectedTask(response.data.task);
      }
    } catch (error) {
      alert(t("errorSavingTask"));
    }
  };

  const handleAddComment = async (comment) => {
    try {
      const response = await axiosInstance.post(
        `/tasks/${selectedTask._id}/comments`,
        { content: comment }
      );
      if (response.data && response.data.task) {
        const translatedTask = await translateTask(response.data.task);
        setTasks(
          tasks.map((task) =>
            task._id === selectedTask._id ? translatedTask : task
          )
        );
        setSelectedTask(translatedTask);
      }
    } catch (error) {
      alert(t("errorAddingComment"));
    }
  };

  const getStatusClass = (status) => {
    if (!status || typeof status !== "string") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
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

  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

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
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {weekDays.map((day) => (
              <div
                key={day.toString()}
                className="bg-white dark:bg-gray-800 p-4 min-h-[200px]"
              >
                <h3 className="text-sm font-semibold text-df-primary dark:text-white">
                  {format(day, "EEEE")}
                </h3>
                <p className="text-xs text-df-primary/70 dark:text-gray-400">
                  {format(day, "MMM d")}
                </p>
                <div className="mt-2 space-y-2">
                  {tasks
                    .filter(
                      (task) =>
                        format(new Date(task.dueDate), "yyyy-MM-dd") ===
                        format(day, "yyyy-MM-dd")
                    )
                    .map((task) => (
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
            ))}
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusUpdate={handleStatusUpdate}
          onAddComment={handleAddComment}
          userRole={currentUser.role}
          userId={currentUser.id}
          getStatusClass={getStatusClass}
          renderStatus={renderStatus}
        />
      )}
    </div>
  );
}

export default WeekView;
