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
  onEdit,
}) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const { translateTask } = useTaskTranslation();
  const [translatedTask, setTranslatedTask] = useState(task);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState(null);

  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";

  useEffect(() => {
    const updateTranslation = async () => {
      const translated = await translateTask(task);
      setTranslatedTask(translated);
    };
    updateTranslation();
  }, [task, translateTask]);

  useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        assignedTo: task.assignedTo?._id || task.assignedTo,
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
      });
    }
  }, [task]);

  const handleEdit = async () => {
    if (editedTask) {
      await onEdit(editedTask);
      setEditMode(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArchive = async () => {
    try {
      await onArchive(task);
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
              {t("edit.task")}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("title")}
                </label>
                <input
                  type="text"
                  name="title"
                  value={editedTask?.title || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("description")}
                </label>
                <textarea
                  name="description"
                  value={editedTask?.description || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("dueDate")}
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={editedTask?.dueDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("assignedTo")}
                </label>
                <select
                  name="assignedTo"
                  value={editedTask?.assignedTo || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{t("selectUser")}</option>
                  {Array.isArray(users) && users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {`Debug - Available users: ${users?.length || 0}`}
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90"
                >
                  {t("save")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("title")}
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {translatedTask.title}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("description")}
                </h4>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {translatedTask.description}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("dueDate")}
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {translatedTask.dueDate
                    ? format(new Date(translatedTask.dueDate), "yyyy-MM-dd")
                    : t("noDate")}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("assignedTo")}
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {translatedTask.assignedTo?.name || t("unassigned")}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("status")}
                </h4>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                    translatedTask.status
                  )}`}
                >
                  {renderStatus(translatedTask.status)}
                </span>
              </div>

              {isAdmin && (
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-df-primary rounded-md hover:bg-df-primary/90"
                  >
                    {t("edit")}
                  </button>
                  <button
                    onClick={handleArchive}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {translatedTask.isActive ? t("archive") : t("unarchive")}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium text-df-primary dark:text-white mb-4">
              {t("comments")}
            </h3>
            <div className="space-y-4">
              {translatedTask.comments && translatedTask.comments.length > 0 ? (
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
                            onToggleCommentStatus(
                              translatedTask._id,
                              comment._id
                            )
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
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
