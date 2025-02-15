import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTaskUtils } from "../../hooks/useTaskUtils";
import TaskItem from "./TaskItem";

const TaskList = ({ 
  tasks, 
  onTaskClick, 
  onEdit, 
  onToggleStatus, 
  showActions = true, 
  isAdmin = false 
}) => {
  const { t } = useTranslation();
  const { getStatusClass, renderStatus } = useTaskUtils();

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tasks]);

  const handleTaskClick = useCallback((task) => {
    onTaskClick?.(task);
  }, [onTaskClick]);

  if (!tasks.length) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        {t("noTasks")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <TaskListHeader showActions={showActions} />
        <tbody>
          {sortedTasks.map(task => (
            <TaskItem 
              key={task._id}
              task={task}
              onTaskClick={handleTaskClick}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              showActions={showActions}
              isAdmin={isAdmin}
              getStatusClass={getStatusClass}
              renderStatus={renderStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(TaskList); 