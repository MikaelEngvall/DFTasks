import { useTranslation } from "react-i18next";

export const useTaskUtils = () => {
  const { t } = useTranslation();

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "in progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cannot fix":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "pending":
        return t("pending");
      case "in progress":
        return t("inProgress");
      case "completed":
        return t("completed");
      case "cannot fix":
        return t("cannotFix");
      default:
        return status;
    }
  };

  return {
    getStatusClass,
    renderStatus,
  };
};
