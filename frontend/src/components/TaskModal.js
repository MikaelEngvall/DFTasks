import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useTaskTranslation } from "../hooks/useTaskTranslation";
import axiosInstance from "../utils/axios";
import { toast } from "react-hot-toast";

function TaskModal({
  task,
  onClose,
  onStatusUpdate,
  onAddComment,
  onArchive,
  userRole,
  userId,
  getStatusClass,
  renderStatus,
  users,
}) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const { t } = useTranslation();
  const { translateTask } = useTaskTranslation();

  useEffect(() => {
    const updateTranslation = async () => {
      if (task) {
        const translatedTask = await translateTask(task);
        console.log("Task translated:", translatedTask);
      }
    };
    updateTranslation();
  }, [task]);

  useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        dueDate: format(new Date(task.dueDate), "yyyy-MM-dd"),
      });
    }
  }, [task]);

  const handleEdit = async () => {
    try {
      const response = await axiosInstance.patch(`/tasks/${task._id}`, {
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        assignedTo: editedTask.assignedTo?._id,
        dueDate: editedTask.dueDate,
      });

      if (response.data) {
        onStatusUpdate(response.data.task);
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleArchive = async () => {
    try {
      console.log("Toggling task status for task:", task._id);
      const response = await axiosInstance.patch(`/tasks/${task._id}/toggle`);

      if (response.data) {
        console.log("Task status toggled successfully:", response.data);
        onArchive(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error toggling task status:", error);
      toast.error(t("errorTogglingTaskStatus"));
    }
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    onAddComment(task._id, comment)
      .then(() => {
        setComment("");
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (!task || !editedTask) return null;

  const canEdit =
    userRole === "ADMIN" ||
    userRole === "SUPERADMIN" ||
    task.assignedTo?._id === userId;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
        &#8203;
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("title")}
                      </label>
                      <input
                        type="text"
                        value={editedTask.title}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            title: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("description")}
                      </label>
                      <textarea
                        value={editedTask.description}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            description: e.target.value,
                          })
                        }
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("status")}
                      </label>
                      <select
                        value={editedTask.status}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            status: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
                      >
                        <option value="pending">{t("pending")}</option>
                        <option value="in progress">{t("inProgress")}</option>
                        <option value="completed">{t("completed")}</option>
                        <option value="cannot fix">{t("cannotFix")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("assignedTo")}
                      </label>
                      <select
                        value={editedTask.assignedTo?._id || ""}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            assignedTo: { _id: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">{t("selectUser")}</option>
                        {users?.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("dueDate")}
                      </label>
                      <input
                        type="date"
                        value={editedTask.dueDate}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            dueDate: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-df-primary focus:ring-df-primary dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {task.description}
                      </p>
                      <div className="mt-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                            task.status
                          )}`}
                        >
                          {renderStatus(task.status)}
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          {t("assignedTo")}:{" "}
                          {task.assignedTo?.name || t("unassigned")}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          {t("dueDate")}:{" "}
                          {format(new Date(task.dueDate), "yyyy-MM-dd")}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    {t("comments")}
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {task.comments && task.comments.length > 0 ? (
                      task.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="bg-gray-50 dark:bg-gray-700 p-2 rounded"
                        >
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
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("noComments")}
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="shadow-sm focus:ring-df-primary focus:border-df-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder={t("writeComment")}
                      rows="2"
                    ></textarea>
                    <button
                      onClick={handleAddComment}
                      disabled={isSubmitting || !comment.trim()}
                      className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-df-primary hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? t("sending") : t("send")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {canEdit && (
              <>
                {editMode ? (
                  <button
                    onClick={handleEdit}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-df-primary text-base font-medium text-white hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {t("save")}
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-df-primary text-base font-medium text-white hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {t("edit")}
                  </button>
                )}
                {(userRole === "ADMIN" || userRole === "SUPERADMIN") && (
                  <button
                    onClick={handleArchive}
                    className="px-4 py-2 text-sm font-medium text-white bg-df-primary hover:bg-df-primary/90 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
                  >
                    {task.isActive ? t("deactivate") : t("activate")}
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary sm:mt-0 sm:w-auto sm:text-sm"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
