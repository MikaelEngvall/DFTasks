import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

function PendingTaskModal({ task, users, onClose, onApprove, onDecline }) {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [assignedTo, setAssignedTo] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = (e) => {
    e.preventDefault();
    onApprove(task._id, {
      assignedTo,
      dueDate: new Date(dueDate),
    });
  };

  const handleDeclineSubmit = async () => {
    if (!declineReason.trim()) {
      toast.error(t("declineReasonRequired"));
      return;
    }
    await onDecline(task._id, declineReason);
    onClose();
  };

  // Funktion för att hämta översatt innehåll baserat på aktuellt språk
  const getTranslatedContent = (content) => {
    if (!content) return '';
    
    // Om innehållet är ett översättningsobjekt, returnera rätt språkversion
    if (content[currentLanguage]) {
      return content[currentLanguage];
    }
    
    // Fallback till originalspråket om översättning saknas
    return content.sv || content.en || content;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-[56] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-df-primary dark:text-white">
              {t("granska.uppgift")}
            </h3>
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

            {/* Beskrivning med översättningsstöd */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("beskrivning")}
              </label>
              <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {getTranslatedContent(task.description)}
                </p>
              </div>
            </div>

            {/* Teknisk information med översättningsstöd */}
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>{t("datum")}: {format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm')}</p>
              <p>{t("sidansUrl")}: {task.url}</p>
              <p>{t("useragent")}: {task.userAgent}</p>
              <p>{t("ip")}: {task.ip}</p>
              <p>{t("drivsMed")}: {task.platform}</p>
            </div>

            {!showDeclineForm ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
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
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDeclineForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    {t("avvisa")}
                  </button>
                  <button
                    type="submit"
                    disabled={!assignedTo}
                    className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90 disabled:opacity-50"
                  >
                    {t("godkann")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6">
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder={t("declineReasonPlaceholder")}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
                  rows={4}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeclineForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {t("stang")}
                  </button>
                  <button
                    onClick={handleDeclineSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    {t("avvisa")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PendingTaskModal;
