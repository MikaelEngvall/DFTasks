import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { FaEdit, FaTrash, FaPlus, FaComments } from "react-icons/fa";
import TaskForm from "./TaskForm";
import { useTheme } from "../context/ThemeContext";
import { format } from "date-fns";

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [comment, setComment] = useState("");
  const { darkMode } = useTheme();
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get("/api/tasks");
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks");
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreate = async (taskData) => {
    try {
      const response = await axiosInstance.post("/api/tasks", taskData);
      setTasks([...tasks, response.data]);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task");
    }
  };

  const handleEdit = async (taskData) => {
    try {
      const response = await axiosInstance.put(
        `/api/tasks/${selectedTask._id}`,
        taskData
      );
      setTasks(
        tasks.map((task) =>
          task._id === selectedTask._id ? response.data : task
        )
      );
      setShowModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task");
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axiosInstance.delete(`/api/tasks/${taskId}`);
        setTasks(tasks.filter((task) => task._id !== taskId));
      } catch (error) {
        console.error("Error deleting task:", error);
        setError("Failed to delete task");
      }
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const openTaskDetails = (task) => {
    setSelectedTaskDetails(task);
    setShowDetailsModal(true);
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
    } catch (error) {
      console.error("Error adding comment:", error);
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

      if (selectedTaskDetails && selectedTaskDetails._id === taskId) {
        setSelectedTaskDetails(response.data);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cannot fix":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskForm(true);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (selectedTask) {
        await axiosInstance.put(`/api/tasks/${selectedTask._id}`, taskData);
      } else {
        await axiosInstance.post("/api/tasks", taskData);
      }
      setShowTaskForm(false);
      await fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-df-primary dark:border-df-accent"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-df-primary dark:text-white">
          Task Management
        </h1>
        <button
          onClick={handleCreateTask}
          className="bg-df-primary text-white px-4 py-2 rounded-md hover:bg-df-dark transition-colors duration-150"
        >
          Add Task
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-df-primary/10 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  TITLE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  DESCRIPTION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ASSIGNED TO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  DUE DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <tr
                  key={task._id}
                  className="hover:bg-df-primary/5 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openTaskDetails(task)}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-df-primary dark:text-white">
                        {task.title}
                      </span>
                      {task.comments?.length > 0 && (
                        <FaComments className="ml-2 text-df-secondary dark:text-df-accent" />
                      )}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => openTaskDetails(task)}
                  >
                    <div className="text-sm text-df-primary/80 dark:text-gray-300 max-w-xs truncate">
                      {task.description}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openTaskDetails(task)}
                  >
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : task.status === "in progress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                          : task.status === "cannot fix"
                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openTaskDetails(task)}
                  >
                    <div className="text-sm text-df-primary/80 dark:text-gray-300">
                      {task.assignedTo?.name || "Unassigned"}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openTaskDetails(task)}
                  >
                    <div className="text-sm text-df-primary/80 dark:text-gray-300">
                      {format(new Date(task.dueDate), "yyyy-MM-dd")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Förhindra att detaljvyn öppnas
                          setSelectedTask(task);
                          setShowModal(true);
                        }}
                        className="text-df-secondary hover:text-df-primary dark:text-df-accent dark:hover:text-white transition-colors duration-150"
                        title="Edit task"
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Förhindra att detaljvyn öppnas
                          handleDelete(task._id);
                        }}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-150"
                        title="Delete task"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <TaskForm
          task={selectedTask}
          users={users}
          onClose={() => setShowModal(false)}
          onSubmit={handleEdit}
        />
      )}

      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-df-primary dark:text-white">
                  {selectedTaskDetails.title}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-df-primary dark:text-white mb-2">
                    Beskrivning
                  </h3>
                  <p className="text-df-primary/80 dark:text-gray-300">
                    {selectedTaskDetails.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-df-primary/70 dark:text-gray-400">
                      Status
                    </h4>
                    <span
                      className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedTaskDetails.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : selectedTaskDetails.status === "in progress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                          : selectedTaskDetails.status === "cannot fix"
                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      }`}
                    >
                      {selectedTaskDetails.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-df-primary/70 dark:text-gray-400">
                      Tilldelad till
                    </h4>
                    <p className="mt-1 text-df-primary dark:text-white">
                      {selectedTaskDetails.assignedTo?.name || "Ej tilldelad"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-df-primary/70 dark:text-gray-400">
                      Förfallodatum
                    </h4>
                    <p className="mt-1 text-df-primary dark:text-white">
                      {format(
                        new Date(selectedTaskDetails.dueDate),
                        "yyyy-MM-dd"
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-df-primary dark:text-white mb-4">
                    Kommentarer
                  </h3>
                  <div className="space-y-4 mb-4">
                    {selectedTaskDetails.comments?.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-df-primary/5 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <p className="text-df-primary dark:text-gray-100">
                          {comment.content}
                        </p>
                        <div className="mt-2 text-sm text-df-primary/70 dark:text-gray-400">
                          {comment.createdBy?.name} -{" "}
                          {format(
                            new Date(comment.createdAt),
                            "yyyy-MM-dd HH:mm"
                          )}
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
                      onClick={() => handleAddComment(selectedTaskDetails._id)}
                      className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-df-primary hover:bg-df-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-secondary dark:ring-offset-gray-800"
                    >
                      Lägg till kommentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <TaskForm
              task={selectedTask}
              onSubmit={handleTaskSubmit}
              onCancel={() => setShowTaskForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManagement;
