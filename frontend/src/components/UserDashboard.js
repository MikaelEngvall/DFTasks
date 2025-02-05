import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { format } from "date-fns";

function UserDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState("");
  const { darkMode } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
    fetchUserTasks();
  }, []);

  const fetchUserTasks = async () => {
    try {
      const response = await axiosInstance.get("/api/tasks/assigned");
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks");
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/api/tasks/${taskId}/status`, {
        status: newStatus,
      });
      setTasks(
        tasks.map((task) => (task._id === taskId ? response.data : task))
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleAddComment = async (taskId) => {
    try {
      const response = await axiosInstance.post(
        `/api/tasks/${taskId}/comments`,
        {
          content: comment,
        }
      );
      setTasks(
        tasks.map((task) => (task._id === taskId ? response.data : task))
      );
      setComment("");
      setSelectedTask(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Get first name from full name
  const getFirstName = (fullName) => {
    return fullName ? fullName.split(" ")[0] : "";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-500" />;
      case "in progress":
        return <FaClock className="text-yellow-500" />;
      case "cannot fix":
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaExclamationCircle className="text-blue-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "cannot fix":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-df-light dark:bg-dark">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-df-primary dark:border-df-accent"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-df-light dark:bg-dark pt-20 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-df-primary dark:text-white mb-6">
            Mina uppgifter
          </h1>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Inga uppgifter tilldelade
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white dark:bg-gray-700 shadow rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-df-primary dark:text-white">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Förfaller:{" "}
                          {format(new Date(task.dueDate), "yyyy-MM-dd")}
                        </span>
                      </div>
                      <div className="mt-4">
                        {task.comments.map((comment) => (
                          <div
                            key={comment._id}
                            className="border-b border-gray-200 dark:border-gray-600 pb-2"
                          >
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.text}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Av: {comment.author.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value)
                        }
                        className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-df-secondary focus:border-df-secondary sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="in progress">In Progress</option>
                        <option value="completed">Done</option>
                        <option value="cannot fix">Cannot Fix</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
