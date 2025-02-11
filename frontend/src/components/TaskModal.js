import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useTaskTranslation } from "../hooks/useTaskTranslation";

function TaskModal({
  task,
  onClose,
  onStatusUpdate,
  onAddComment,
  userRole,
  userId,
  getStatusClass,
  renderStatus,
}) {
  const [editedStatus, setEditedStatus] = useState(null);
  const [newComment, setNewComment] = useState("");
  const { t } = useTranslation();
  const { translateTask, currentLanguage } = useTaskTranslation();
  const [translatedTask, setTranslatedTask] = useState(task);

  useEffect(() => {
    const updateTranslation = async () => {
      if (task) {
        try {
          const translated = await translateTask(task);
          if (translated) {
            setTranslatedTask(translated);
          }
        } catch (error) {
          console.error("Error translating task:", error);
          setTranslatedTask(task);
        }
      }
    };
    updateTranslation();
  }, [currentLanguage, translateTask, task]);

  const handleStatusUpdate = () => {
    if (!editedStatus || editedStatus === translatedTask.status) return;
    onStatusUpdate(translatedTask, editedStatus);
    setEditedStatus(null);
  };

  const canEditTask = () => {
    if (!userRole || !userId || !translatedTask) return false;
    return (
      userRole === "ADMIN" ||
      userRole === "SUPERADMIN" ||
      translatedTask.assignedTo?._id === userId
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !translatedTask?._id) return;
    if (typeof onAddComment === "function") {
      onAddComment(translatedTask._id, newComment);
      setNewComment("");
    }
  };

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto">
      <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-16">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
          <div className="sticky top-0 z-[56] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-df-primary dark:text-white pr-8">
                {translatedTask.title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 absolute top-4 right-4"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-df-primary dark:text-white">
                    {t("description")}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {translatedTask.description}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-df-primary dark:text-white">
                    {t("status")}
                  </h4>
                  {canEditTask() ? (
                    <div className="space-y-2">
                      <select
                        value={editedStatus || translatedTask.status}
                        onChange={(e) => setEditedStatus(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring focus:ring-df-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-df-primary dark:text-white"
                      >
                        <option value="pending">{t("pending")}</option>
                        <option value="in progress">{t("inProgress")}</option>
                        <option value="completed">{t("completed")}</option>
                        <option value="cannot fix">{t("cannotFix")}</option>
                      </select>
                      {editedStatus &&
                        editedStatus !== translatedTask.status && (
                          <button
                            onClick={handleStatusUpdate}
                            className="w-full px-3 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90 transition-colors duration-150"
                          >
                            {t("save")}
                          </button>
                        )}
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          translatedTask.status
                        )}`}
                      >
                        {renderStatus(translatedTask.status)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-df-primary dark:text-white">
                    {t("assignedTo")}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {translatedTask.assignedTo?.name || t("unassigned")}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-df-primary dark:text-white">
                    {t("deadline")}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {format(new Date(translatedTask.dueDate), "PPP")}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-df-primary dark:text-white mb-4">
                  {t("comments")}
                </h4>
                <div className="space-y-4">
                  {translatedTask.comments?.length > 0 ? (
                    translatedTask.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {comment.content}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {comment.createdBy?.name} -{" "}
                          {format(
                            new Date(comment.createdAt),
                            "yyyy-MM-dd HH:mm"
                          )}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("noComments")}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  {canEditTask() && (
                    <div className="mt-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t("writeComment")}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-df-primary focus:border-df-primary dark:bg-gray-700 dark:text-white"
                        rows="3"
                      />
                      <button
                        onClick={handleAddComment}
                        className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
                      >
                        {t("addComment")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
