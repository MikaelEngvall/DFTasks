import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Task, User } from "../types/task";

interface TaskFormProps {
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Task>;
  users?: User[];
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  users = [],
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    assignedTo: undefined,
    dueDate: "",
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    address: "",
    apartmentNumber: "",
    ...initialData,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ett fel uppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("title")} *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("description")} *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="assignedTo"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("assignedTo")}
        </label>
        <select
          id="assignedTo"
          name="assignedTo"
          value={formData.assignedTo?._id || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
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
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("dueDate")} *
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate || ""}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="reporterName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("name")} *
          </label>
          <input
            type="text"
            id="reporterName"
            name="reporterName"
            value={formData.reporterName || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="reporterPhone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("phone")} *
          </label>
          <input
            type="tel"
            id="reporterPhone"
            name="reporterPhone"
            value={formData.reporterPhone || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="reporterEmail"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t("email")} *
        </label>
        <input
          type="email"
          id="reporterEmail"
          name="reporterEmail"
          value={formData.reporterEmail || ""}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("address")} *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="apartmentNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("apartmentNumber")} *
          </label>
          <input
            type="text"
            id="apartmentNumber"
            name="apartmentNumber"
            value={formData.apartmentNumber || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-df-primary border border-transparent rounded-md shadow-sm hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 