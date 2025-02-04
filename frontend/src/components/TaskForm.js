import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";

function TaskForm({ task, onSubmit, onCancel }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "pending",
    assignedUsers: task?.assignedUsers || [], // Ensure this line is correct
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/api/users");
        setUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        setError("Kunde inte hämta användare");
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Form data being submitted:", formData); // Debug log

      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        dueDate: formData.dueDate,
        assignedUsers: formData.assignedUsers || [], // Ensure this line is correct
      };

      await onSubmit(taskData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Titel *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Beskrivning *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
        >
          <option value="pending">Väntande</option>
          <option value="in progress">Pågående</option>
          <option value="completed">Avslutad</option>
          <option value="cannot fix">Kan inte åtgärdas</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tilldela till
        </label>
        <select
          name="assignedUsers" // Ensure this line is correct
          value={formData.assignedUsers} // Ensure this line is correct
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              assignedUsers: Array.from(
                e.target.selectedOptions,
                (option) => option.value
              ),
            }))
          }
          multiple
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Välj användare</option>
          {users &&
            users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Förfallodatum *
        </label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
        >
          Avbryt
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
        >
          {task ? "Uppdatera" : "Skapa"}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
