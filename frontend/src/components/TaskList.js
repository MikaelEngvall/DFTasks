import React, { useCallback } from 'react';
import VirtualList from './common/VirtualList';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaComments } from "react-icons/fa";
import { format, isValid } from "date-fns";
import { useTaskUtils } from "../utils/taskUtils";

const TaskList = ({
  tasks,
  onTaskClick,
  onEdit,
  onToggleStatus,
  showActions = true,
  isAdmin = false,
  getUserName,
}) => {
  const { t } = useTranslation();
  const { getStatusClass, renderStatus } = useTaskUtils();

  const formatDate = (dateString, formatStr = "yyyy-MM-dd") => {
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

  const renderTask = useCallback((task) => (
    <div 
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
        !task.isActive ? 'opacity-50' : ''
      }`}
      onClick={() => onTaskClick(task)}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {task.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {task.description}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(task.status)}`}>
            {renderStatus(task.status)}
          </span>
          {showActions && isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              Redigera
            </button>
          )}
        </div>
      </div>
    </div>
  ), [onTaskClick, onEdit, getStatusClass, renderStatus, showActions, isAdmin]);

  if (!tasks.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('noTasks')}
      </div>
    );
  }

  return (
    <VirtualList
      items={tasks}
      renderItem={renderTask}
      itemHeight={80}
      containerHeight={600}
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    />
  );
};

export default React.memo(TaskList);
