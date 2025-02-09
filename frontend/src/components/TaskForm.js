import React, { useState, useEffect } from "react";
import { useForm } from "../hooks/useForm";
import { useTranslation } from "react-i18next";
import { format, isValid } from "date-fns";
import { translateContent } from "../utils/translateContent";

const TaskForm = ({ onSubmit, initialData = {}, users = [] }) => {
  const { t, i18n } = useTranslation();
  const { formData, handleChange, handleSubmit } = useForm(
    initialData,
    onSubmit
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      const translateTask = async () => {
        const translatedTask = await translateContent(
          initialData,
          i18n.language
        );
        handleChange({
          target: { name: "title", value: translatedTask.title || "" },
        });
        handleChange({
          target: {
            name: "description",
            value: translatedTask.description || "",
          },
        });
        handleChange({
          target: { name: "status", value: translatedTask.status || "pending" },
        });
        handleChange({
          target: {
            name: "assignedTo",
            value: translatedTask.assignedTo?._id || "",
          },
        });
        handleChange({
          target: {
            name: "dueDate",
            value: translatedTask.dueDate
              ? isValid(new Date(translatedTask.dueDate))
                ? format(new Date(translatedTask.dueDate), "yyyy-MM-dd")
                : format(new Date(), "yyyy-MM-dd")
              : format(new Date(), "yyyy-MM-dd"),
          },
        });
      };
      translateTask();
    }
  }, [initialData, i18n.language, handleChange]);

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
        <label className="block text-sm font-medium text-gray-700">
          {t("title")}
        </label>
        <input
          type="text"
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("description")}
        </label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("status")}
        </label>
        <select
          name="status"
          value={formData.status || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="pending">{t("pending")}</option>
          <option value="in progress">{t("inProgress")}</option>
          <option value="completed">{t("completed")}</option>
          <option value="cannot fix">{t("cannotFix")}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("assignedTo")}
        </label>
        <select
          name="assignedTo"
          value={formData.assignedTo || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
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
        <label className="block text-sm font-medium text-gray-700">
          {t("dueDate")}
        </label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t("submit")}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
