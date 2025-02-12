import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useTaskTranslation } from "../hooks/useTaskTranslation";
import axiosInstance from "../utils/axios";
import { toast } from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

function TaskModal({
  task,
  onClose,
  onStatusUpdate,
  onAddComment,
  onArchive,
  onToggleCommentStatus,
  userRole,
  userId,
  getStatusClass,
  renderStatus,
  users,
}) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const { translateTask } = useTaskTranslation();
  const [translatedTask, setTranslatedTask] = useState(task);

  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";

  useEffect(() => {
    const updateTranslation = async () => {
      const translated = await translateTask(task);
      setTranslatedTask(translated);
    };
    updateTranslation();
  }, [task, translateTask]);

  const handleEdit = async () => {
    // Implementera redigering här
  };

  const handleArchive = async () => {
    try {
      const response = await axiosInstance.patch(`/tasks/${task._id}/toggle`);
      if (response.data) {
        onArchive(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error archiving task:", error);
      toast.error(t("errorTogglingTaskStatus"));
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    onAddComment(task._id, newComment)
      .then(() => {
        setNewComment("");
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-df-primary dark:text-white">
              {translatedTask.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {translatedTask.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t("status")}:{" "}
                </span>
                <span
                  className={`inline-block px-2 py-1 text-sm rounded ${getStatusClass(
                    task.status
                  )}`}
                >
                  {renderStatus(task.status)}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t("assignedTo")}:{" "}
                </span>
                <span className="text-df-primary dark:text-white">
                  {task.assignedTo?.name || t("unassigned")}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t("dueDate")}:{" "}
                </span>
                <span className="text-df-primary dark:text-white">
                  {format(new Date(task.dueDate), "yyyy-MM-dd")}
                </span>
              </div>
            </div>

            {/* Status uppdatering */}
            <div className="flex items-center space-x-4">
              <select
                value={task.status}
                onChange={(e) => onStatusUpdate(task, e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-df-primary focus:border-df-primary sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">{t("pending")}</option>
                <option value="in progress">{t("inProgress")}</option>
                <option value="completed">{t("completed")}</option>
                <option value="cannot fix">{t("cannotFix")}</option>
              </select>
            </div>

            {/* Kommentarer */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-df-primary dark:text-white mb-4">
                {t("comments")}
              </h3>
              <div className="space-y-4">
                {translatedTask.comments &&
                translatedTask.comments.length > 0 ? (
                  translatedTask.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className={`p-4 rounded-lg ${
                        comment.isActive
                          ? "bg-gray-50 dark:bg-gray-700"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-2">
                          <span className="font-medium text-df-primary dark:text-white">
                            {comment.createdBy?.name || t("unassigned")}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {format(
                              new Date(comment.createdAt),
                              "yyyy-MM-dd HH:mm"
                            )}
                          </span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() =>
                              onToggleCommentStatus(task._id, comment._id)
                            }
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {comment.isActive ? t("archive") : t("unarchive")}
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("noComments")}
                  </p>
                )}
              </div>

              {/* Lägg till kommentar */}
              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t("writeComment")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-df-primary focus:border-df-primary dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-4 py-2 bg-df-primary text-white rounded-md hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t("sending") : t("send")}
                  </button>
                </div>
              </div>
            </div>

            {/* Arkivera knapp - endast för admin */}
            {isAdmin && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleArchive}
                  className="px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
                >
                  {task.isActive ? t("archive") : t("unarchive")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
