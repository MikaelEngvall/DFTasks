import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { FaEdit, FaArchive, FaUndo } from "react-icons/fa";
import TaskForm from "./TaskForm";
import { Task, User } from "../types/task";
import { useTaskUtils } from "../utils/taskUtils";

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onStatusUpdate: (task: Task, newStatus: Task["status"]) => Promise<void>;
  onAddComment: (taskId: string, comment: string) => Promise<void>;
  onArchive?: (task: Task) => Promise<void>;
  onToggleCommentStatus?: (taskId: string, commentId: string) => Promise<void>;
  onEdit?: (task: Task) => void;
  userRole?: string;
  userId?: string;
  getStatusClass: (status: Task["status"]) => string;
  renderStatus: (status: Task["status"]) => string;
  users?: User[];
}

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  onClose,
  onStatusUpdate,
  onAddComment,
  onArchive,
  onToggleCommentStatus,
  onEdit,
  userRole,
  userId,
  getStatusClass,
  renderStatus,
  users = [],
}) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusUpdate = async (newStatus: Task["status"]) => {
    try {
      await onStatusUpdate(task, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(task._id, comment);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (onArchive) {
      try {
        await onArchive(task);
        onClose();
      } catch (error) {
        console.error("Error archiving task:", error);
      }
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
      setIsEditing(true);
    }
  };

  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
  const canEdit = isAdmin || task.assignedTo?._id === userId;

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <TaskForm
              initialData={task}
              onSubmit={async (taskData) => {
                if (onEdit) {
                  await onEdit({ ...task, ...taskData });
                  setIsEditing(false);
                }
              }}
              onCancel={() => setIsEditing(false)}
              users={users}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {task.title}
              </h3>
              <div className="flex items-center space-x-2">
                {canEdit && (
                  <button
                    onClick={handleEdit}
                    className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80"
                    title={t("edit")}
                  >
                    <FaEdit className="h-5 w-5" />
                  </button>
                )}
                {isAdmin && onArchive && (
                  <button
                    onClick={handleArchive}
                    className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80"
                    title={task.isActive ? t("archive") : t("unarchive")}
                  >
                    {task.isActive ? (
                      <FaArchive className="h-5 w-5" />
                    ) : (
                      <FaUndo className="h-5 w-5" />
                    )}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
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
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("description")}
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {task.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("status")}
                  </p>
                  {canEdit ? (
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusUpdate(e.target.value as Task["status"])
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm ${getStatusClass(
                        task.status
                      )}`}
                    >
                      <option value="pending">{t("pending")}</option>
                      <option value="in progress">{t("inProgress")}</option>
                      <option value="completed">{t("completed")}</option>
                      <option value="cannot fix">{t("cannotFix")}</option>
                    </select>
                  ) : (
                    <span
                      className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                        task.status
                      )}`}
                    >
                      {renderStatus(task.status)}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("dueDate")}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {format(new Date(task.dueDate), "yyyy-MM-dd")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("reporterName")}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {task.reporterName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("reporterPhone")}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {task.reporterPhone}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("reporterEmail")}
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {task.reporterEmail}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("address")}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {task.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("apartmentNumber")}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {task.apartmentNumber}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t("comments")}
                </p>
                <div className="space-y-4">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 ${
                          !comment.isActive ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {comment.content}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.createdBy?.name} -{" "}
                              {format(
                                new Date(comment.createdAt),
                                "yyyy-MM-dd HH:mm"
                              )}
                            </p>
                          </div>
                          {isAdmin && onToggleCommentStatus && (
                            <button
                              onClick={() =>
                                onToggleCommentStatus(task._id, comment._id)
                              }
                              className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80 text-sm"
                            >
                              {comment.isActive
                                ? t("deactivate")
                                : t("activate")}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("noComments")}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t("writeComment")}
                      className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!comment.trim() || isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-df-primary border border-transparent rounded-md shadow-sm hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? t("sending") : t("send")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal; 