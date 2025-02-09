import React from "react";
import { useForm } from "../hooks/useForm";
import { useTranslation } from "react-i18next";

const UserForm = ({ onSubmit, initialData = {} }) => {
  const { t } = useTranslation();
  const { formData, handleChange, handleSubmit } = useForm(
    initialData,
    onSubmit
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("name")}
        </label>
        <input
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("email")}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("role")}
        </label>
        <select
          name="role"
          value={formData.role || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">{t("selectRole")}</option>
          <option value="user">{t("user")}</option>
          <option value="admin">{t("admin")}</option>
        </select>
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

export default UserForm;
