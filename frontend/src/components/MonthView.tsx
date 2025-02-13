import React, { useState, useEffect, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { sv } from "date-fns/locale";
import { AutoSizer, List } from 'react-virtualized';
import TaskList from "./TaskList";
import { useTaskUtils } from "../utils/taskUtils";
// Lazy load modaler
const TaskModal = lazy(() => import("./TaskModal"));
const TaskForm = lazy(() => import("./TaskForm"));
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  addComment,
  archiveTask,
  toggleCommentStatus,
  selectTasks,
  selectLoading,
  selectError,
  selectSelectedTask,
  setSelectedTask,
} from "../store/slices/tasksSlice";
import { selectUser } from "../store/slices/authSlice";
import { Task, User } from "../types/task";
import { AppDispatch } from "../store";
import toast from "react-hot-toast";

interface MonthViewProps {
  users: User[];
}

const MonthView: React.FC<MonthViewProps> = ({ users }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { getStatusClass, renderStatus } = useTaskUtils();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);

  const tasks = useSelector(selectTasks);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const selectedTask = useSelector(selectSelectedTask);
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchTasks({ showInactive: false })).unwrap();
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await dispatch(createTask(taskData)).unwrap();
      setIsCreating(false);
      toast.success(t("taskCreated"));
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(t("errorCreatingTask"));
    }
  };

  const handleStatusUpdate = async (task: Task, newStatus: Task["status"]) => {
    try {
      await dispatch(
        updateTaskStatus({ taskId: task._id, status: newStatus })
      ).unwrap();
      toast.success(t("statusUpdated"));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("errorUpdatingStatus"));
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    try {
      await dispatch(addComment({ taskId, content })).unwrap();
      toast.success(t("commentAdded"));
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(t("errorAddingComment"));
    }
  };

  const handleArchive = async (task: Task) => {
    try {
      await dispatch(archiveTask(task._id)).unwrap();
      toast.success(t("taskArchived"));
    } catch (error) {
      console.error("Error archiving task:", error);
      toast.error(t("errorArchivingTask"));
    }
  };

  const handleToggleCommentStatus = async (
    taskId: string,
    commentId: string
  ) => {
    try {
      await dispatch(toggleCommentStatus({ taskId, commentId })).unwrap();
      toast.success(t("commentStatusToggled"));
    } catch (error) {
      console.error("Error toggling comment status:", error);
      toast.error(t("errorTogglingCommentStatus"));
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const tasksForDay = (date: Date) => {
    return tasks.filter(
      (task: Task) =>
        format(new Date(task.dueDate), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
  };

  const canEditTask = (task: Task) => {
    return (
      user?.role === "ADMIN" ||
      user?.role === "SUPERADMIN" ||
      task.assignedTo?._id === user?._id
    );
  };

  // Beräkna grid-dimensioner
  const GRID_COLUMNS = 7;
  const CELL_HEIGHT = 200;
  const rowCount = Math.ceil(daysInMonth.length / GRID_COLUMNS);

  const renderRow = ({ index, key, style }: any) => {
    const startIndex = index * GRID_COLUMNS;
    const daysInRow = daysInMonth.slice(startIndex, startIndex + GRID_COLUMNS);

    return (
      <div key={key} style={style} className="flex gap-4">
        {daysInRow.map((date) => (
          <div
            key={format(date, "yyyy-MM-dd")}
            className="flex-1 p-2 border rounded-lg dark:border-gray-700"
          >
            <TaskList
              tasks={tasksForDay(date)}
              onStatusUpdate={handleStatusUpdate}
              onAddComment={handleAddComment}
              onArchive={handleArchive}
              onToggleCommentStatus={handleToggleCommentStatus}
              getStatusClass={getStatusClass}
              renderStatus={renderStatus}
              users={users}
              canEditTask={canEditTask}
              onTaskClick={(task) => dispatch(setSelectedTask(task))}
              getUserName={(user) => user?.name || t("unassigned")}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 text-df-primary hover:bg-gray-100 rounded-full dark:text-white dark:hover:bg-gray-700"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(currentDate, "MMMM yyyy", { locale: sv })}
          </h1>
          <button
            onClick={handleNextMonth}
            className="p-2 text-df-primary hover:bg-gray-100 rounded-full dark:text-white dark:hover:bg-gray-700"
          >
            →
          </button>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-df-primary border border-transparent rounded-md shadow-sm hover:bg-df-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-df-primary"
        >
          {t("createTask")}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-df-primary"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="h-[calc(100vh-200px)]">
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              rowHeight={CELL_HEIGHT}
              rowCount={rowCount}
              rowRenderer={renderRow}
            />
          )}
        </AutoSizer>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
              <Suspense fallback={<div className="animate-spin">Laddar...</div>}>
                <TaskForm
                  onSubmit={handleCreateTask}
                  onCancel={() => setIsCreating(false)}
                  users={users}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <Suspense fallback={<div className="animate-spin">Laddar...</div>}>
          <TaskModal
            task={selectedTask}
            onClose={() => dispatch(setSelectedTask(null))}
            onStatusUpdate={handleStatusUpdate}
            onAddComment={handleAddComment}
            onArchive={handleArchive}
            onToggleCommentStatus={handleToggleCommentStatus}
            onEdit={(task) => dispatch(setSelectedTask(task))}
            userRole={user?.role}
            userId={user?._id}
            getStatusClass={getStatusClass}
            renderStatus={renderStatus}
            users={users}
          />
        </Suspense>
      )}
    </div>
  );
};

export default MonthView; 