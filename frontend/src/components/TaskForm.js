import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

const TaskForm = ({ onSubmit, initialData = {}, users = [] }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    assignedTo: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.status || "pending",
        assignedTo: initialData.assignedTo?._id || "",
        dueDate: initialData.dueDate
          ? format(new Date(initialData.dueDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(t("errorSavingTask"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("title")}
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("description")}
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("status")}
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
          required
          disabled={isSubmitting}
        >
          <option value="pending">{t("pending")}</option>
          <option value="in progress">{t("inProgress")}</option>
          <option value="completed">{t("completed")}</option>
          <option value="cannot fix">{t("cannotFix")}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("assignedTo")}
        </label>
        <select
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
          required
          disabled={isSubmitting}
        >
          <option value="">{t("selectUser")}</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("dueDate")}
        </label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("saving") : t("submit")}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
