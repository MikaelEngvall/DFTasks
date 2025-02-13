import React from "react";
import { useTranslation } from "react-i18next";
import { FaEdit, FaComments } from "react-icons/fa";
import { format, isValid } from "date-fns";
import { useTaskUtils } from "../utils/taskUtils";
import { Task, User } from "../types/task";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onToggleStatus?: (taskId: string, isActive: boolean, e: React.MouseEvent) => void;
  showActions?: boolean;
  isAdmin?: boolean;
  getUserName: (user?: User) => string;
  onStatusUpdate: (task: Task, newStatus: Task["status"]) => Promise<void>;
  onAddComment: (taskId: string, content: string) => Promise<void>;
  onArchive: (task: Task) => Promise<void>;
  onToggleCommentStatus: (taskId: string, commentId: string) => Promise<void>;
  getStatusClass: (status: Task["status"]) => string;
  renderStatus: (status: Task["status"]) => string;
  users: User[];
  canEditTask: (task: Task) => boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onEdit,
  onToggleStatus,
  showActions = true,
  isAdmin = false,
  getUserName,
  onStatusUpdate,
  onAddComment,
  onArchive,
  onToggleCommentStatus,
  getStatusClass,
  renderStatus,
  users,
  canEditTask,
}) => {
  const { t } = useTranslation();
  const { getStatusClass: utilsGetStatusClass, renderStatus: utilsRenderStatus } = useTaskUtils();

  const formatDate = (dateString: string, formatStr: string = "yyyy-MM-dd"): string => {
    if (!dateString || dateString === "00.00.000Z") return t("noDate");
    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        return t("noDate");
      }
      return format(date, formatStr);
    } catch (error) {
      return t("noDate");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t("title")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t("description")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t("status")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t("assignedTo")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t("dueDate")}
            </th>
            {showActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("actions")}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.length === 0 ? (
            <tr>
              <td
                colSpan={showActions ? 6 : 5}
                className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
              >
                {t("noTasks")}
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr
                key={task._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  !task.isActive ? "opacity-50" : ""
                }`}
                onClick={() => onTaskClick(task)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm font-medium text-df-primary dark:text-white">
                    {task.title}
                    {task.comments && task.comments.length > 0 && (
                      <FaComments className="ml-2 text-df-primary/60 dark:text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">
                    {task.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      task.status
                    )}`}
                  >
                    {renderStatus(task.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {getUserName(task.assignedTo)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {formatDate(task.dueDate)}
                  </div>
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => onToggleStatus?.(task._id, task.isActive, e)}
                          className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80"
                        >
                          {task.isActive ? t("deactivate") : t("activate")}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(task);
                          }}
                          className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80 mr-3"
                          title={t("edit")}
                        >
                          <FaEdit className="inline-block" />
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList; 