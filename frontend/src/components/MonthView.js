import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";

function MonthView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
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
        console.log("API Response:", response.data);
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
      alert("Det gick inte att uppdatera uppgiften. Försök igen senare.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Är du säker på att du vill radera denna uppgift?")) {
      try {
        await axiosInstance.delete(`/api/tasks/${taskId}`);
        setTasks(tasks.filter((task) => task._id !== taskId));
        setSelectedTask(null);
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Det gick inte att radera uppgiften. Försök igen senare.");
      }
    }
  };

  const startEditing = (task) => {
    setEditedTask({ ...task });
    setIsEditing(true);
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
            {[
              "Måndag",
              "Tisdag",
              "Onsdag",
              "Torsdag",
              "Fredag",
              "Lördag",
              "Söndag",
            ].map((day) => (
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
              );
            })}
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-df-primary dark:text-white">
                {isEditing ? "Redigera uppgift" : selectedTask.title}
              </h2>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setIsEditing(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-df-primary dark:text-white mb-1">
                      Titel
                    </label>
                    <input
                      type="text"
                      value={editedTask.title}
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-df-primary dark:text-white mb-1">
                      Beskrivning
                    </label>
                    <textarea
                      value={editedTask.description}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-df-primary dark:text-white mb-1">
                      Status
                    </label>
                    <select
                      value={editedTask.status}
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="pending">Väntande</option>
                      <option value="in progress">Pågående</option>
                      <option value="completed">Slutförd</option>
                      <option value="cannot fix">Kan ej åtgärdas</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={handleEditTask}
                      className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90"
                    >
                      Spara
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                      Tilldelad till:{" "}
                      {selectedTask.assignedTo?.name || "Ej tilldelad"}
                    </span>
                  </div>
                  <div className="text-sm text-df-primary/70 dark:text-gray-400">
                    Deadline: {format(new Date(selectedTask.dueDate), "PPP")}
                  </div>
                  {currentUser?.role === "ADMIN" && (
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => startEditing(selectedTask)}
                        className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90"
                      >
                        Redigera
                      </button>
                      <button
                        onClick={() => handleDeleteTask(selectedTask._id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Radera
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthView;
