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

function WeekView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

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
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskClick = (task) => {
    if (currentUser.role === "ADMIN") {
      navigate("/dftasks/admin", {
        state: { selectedTaskId: task._id, view: "tasks" },
      });
    } else if (task.assignedTo?._id === currentUser.id) {
      navigate("/dftasks/dashboard", { state: { selectedTaskId: task._id } });
    } else {
      // Visa bara detaljer för andra användares uppgifter
      setSelectedTask(task);
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

  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  console.log("Tasks:", tasks);
  console.log("Loading:", loading);

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
                            {task.status}
                          </span>
                          <span className="text-xs text-df-primary/70 dark:text-gray-400">
                            {task.assignedTo?.name || "Unassigned"}
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

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-df-primary dark:text-white">
                {selectedTask.title}
              </h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <p className="text-df-primary/80 dark:text-gray-300">
                {selectedTask.description}
              </p>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                    selectedTask.status
                  )}`}
                >
                  {selectedTask.status}
                </span>
                <span className="text-sm text-df-primary/70 dark:text-gray-400">
                  Assigned to: {selectedTask.assignedTo?.name || "Unassigned"}
                </span>
              </div>
              <div className="text-sm text-df-primary/70 dark:text-gray-400">
                Due: {format(new Date(selectedTask.dueDate), "PPP")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeekView;
