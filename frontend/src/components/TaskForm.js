import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { translateContent } from "../utils/translateContent";
import { format, isValid } from "date-fns";

function TaskForm({ task, users, onSubmit, onCancel }) {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    assignedTo: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      const translateTask = async () => {
        const translatedTask = await translateContent(task, i18n.language);
        setFormData({
          title: translatedTask.title || "",
          description: translatedTask.description || "",
          status: translatedTask.status || "pending",
          assignedTo: translatedTask.assignedTo?._id || "",
          dueDate: translatedTask.dueDate
            ? isValid(new Date(translatedTask.dueDate))
              ? format(new Date(translatedTask.dueDate), "yyyy-MM-dd")
              : format(new Date(), "yyyy-MM-dd")
            : format(new Date(), "yyyy-MM-dd"),
        });
      };
      translateTask();
    }
  }, [task, i18n.language]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      ...formData,
      assignedTo: formData.assignedTo || null,
    };
    console.log("Submitting task data:", taskData);
    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-df-primary dark:text-white">
          {t("title")}
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-df-primary dark:text-white">
          {t("description")}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows="4"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-df-primary dark:text-white">
          {t("status")}
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50"
        >
          <option value="pending">{t("pending")}</option>
          <option value="in progress">{t("inProgress")}</option>
          <option value="completed">{t("completed")}</option>
          <option value="cannot fix">{t("cannotFix")}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-df-primary dark:text-white">
          {t("assignedTo")}
        </label>
        <select
          value={formData.assignedTo}
          onChange={(e) =>
            setFormData({ ...formData, assignedTo: e.target.value || null })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50"
        >
          <option value="">{t("unassigned")}</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-df-primary dark:text-white">
          {t("deadline")}
        </label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) =>
            setFormData({ ...formData, dueDate: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90"
        >
          {t("save")}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
