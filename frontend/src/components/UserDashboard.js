import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar";

function UserDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState("");

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

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Welcome back, {getFirstName(user?.name)}
          </h1>

          {tasks.length === 0 ? (
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 text-gray-900 text-center">
                No tasks assigned at the moment
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white shadow overflow-hidden sm:rounded-lg"
                >
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {task.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:px-6">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">
                          Description
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {task.description}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">
                          Status
                        </h4>
                        <div className="mt-2">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task._id, e.target.value)
                            }
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="new">New</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Comments
                        </h4>
                        <div className="space-y-3">
                          {task.comments?.map((comment, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-3 rounded-lg"
                            >
                              <p className="text-sm text-gray-900">
                                {comment.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4">
                          <textarea
                            rows="3"
                            className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></textarea>
                          <button
                            onClick={() => handleAddComment(task._id)}
                            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Add Comment
                          </button>
                        </div>
                      </div>
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
