import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

function PendingTaskModal({ task, users, onClose, onApprove }) {
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    onApprove(task._id, {
      assignedTo,
      dueDate: new Date(dueDate),
    });
  };

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto">
      <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
          <div className="sticky top-0 z-[56] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-df-primary dark:text-white">
                {t("reviewTask")}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">{t("close")}</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Felanmälarinformation */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-df-primary dark:text-white mb-2">
                  {t("reporterInfo")}
                </h4>
                <dl className="grid grid-cols-1 gap-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("name")}:
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {task.reporterName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("email")}:
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {task.reporterEmail}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("phone")}:
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {task.reporterPhone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("address")}:
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {task.address} - {task.apartmentNumber}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Uppgiftsinformation */}
              <div>
                <h4 className="text-sm font-medium text-df-primary dark:text-white mb-2">
                  {t("taskDetails")}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("description")}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulär för godkännande */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="assignedTo"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t("assignTo")}
                  </label>
                  <select
                    id="assignedTo"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    {t("dueDate")}
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90"
                  >
                    {t("approve")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PendingTaskModal;
