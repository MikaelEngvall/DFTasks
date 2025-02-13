import React from "react";
import { useForm } from "../hooks/useForm";
import { useTranslation } from "react-i18next";
import { User } from "../types/task";

interface UserFormProps {
  onSubmit: (data: Partial<User>) => Promise<void>;
  initialData?: Partial<User>;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialData = {} }) => {
  const { t } = useTranslation();
  const { formData, handleChange, handleSubmit } = useForm(
    initialData,
    onSubmit
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("name")}
        </label>
        <input
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("email")}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("role")}
        </label>
        <select
          name="role"
          value={formData.role || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
          required
        >
          <option value="">{t("selectRole")}</option>
          <option value="USER">{t("user")}</option>
          <option value="ADMIN">{t("admin")}</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
        >
          {t("submit")}
        </button>
      </div>
    </form>
  );
};

export default UserForm; 