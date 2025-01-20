import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";
import { FaCheckCircle, FaClock, FaExclamationCircle } from "react-icons/fa";

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
      default:
        return <FaExclamationCircle className="text-blue-500" />;
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
    <div className="min-h-screen bg-df-light dark:bg-dark transition-colors duration-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold text-df-primary dark:text-white mb-6">
          Mina uppgifter
        </h1>

        <div className="space-y-6">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-df-primary/10 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-df-primary dark:text-white">
                    {task.title}
                  </h2>
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(task.status)}
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      className="block w-32 pl-3 pr-10 py-2 text-base border-df-primary/20 dark:border-gray-600 focus:outline-none focus:ring-df-secondary focus:border-df-secondary sm:text-sm rounded-md bg-white dark:bg-gray-700 text-df-primary dark:text-white"
                    >
                      <option value="new">Ny</option>
                      <option value="in progress">Pågående</option>
                      <option value="completed">Klar</option>
                    </select>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-df-primary/80 dark:text-gray-300">
                    {task.description}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-df-primary/70 dark:text-gray-400">
                    <span>
                      Förfaller: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-df-primary dark:text-white mb-4">
                    Kommentarer
                  </h3>
                  <div className="space-y-4 mb-4">
                    {task.comments?.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-df-primary/5 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <p className="text-df-primary dark:text-gray-100">
                          {comment.content}
                        </p>
                        <div className="mt-2 text-sm text-df-primary/70 dark:text-gray-400">
                          {comment.createdBy?.name} -{" "}
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <textarea
                      rows="3"
                      className="block w-full rounded-md border-df-primary/20 dark:border-gray-600 shadow-sm focus:border-df-secondary focus:ring focus:ring-df-secondary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-df-primary dark:text-white"
                      placeholder="Lägg till en kommentar..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    <button
                      onClick={() => handleAddComment(task._id)}
                      className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-df-primary hover:bg-df-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-secondary dark:ring-offset-gray-800"
                    >
                      Lägg till kommentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
