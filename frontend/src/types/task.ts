export interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  isActive: boolean;
  preferredLanguage?: "sv" | "en" | "pl" | "uk";
}

export interface Comment {
  _id: string;
  content: string;
  translations?: {
    sv?: string;
    en?: string;
    pl?: string;
    uk?: string;
  };
  createdBy: User;
  createdAt: string;
  isActive: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  translations?: {
    sv?: {
      title: string;
      description: string;
    };
    en?: {
      title: string;
      description: string;
    };
    pl?: {
      title: string;
      description: string;
    };
    uk?: {
      title: string;
      description: string;
    };
  };
  status: "pending" | "in progress" | "completed" | "cannot fix";
  assignedTo?: User;
  dueDate: string;
  createdBy: User;
  comments?: Comment[];
  isActive: boolean;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  address?: string;
  apartmentNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;
}

export interface FetchTasksParams {
  showInactive?: boolean;
}

export interface UpdateTaskStatusParams {
  taskId: string;
  status: Task["status"];
}

export interface AddCommentParams {
  taskId: string;
  content: string;
}

export interface OptimisticAddCommentParams {
  taskId: string;
  comment: Comment;
}

export type APIResponse<T> = {
  data: T;
  message?: string;
  status?: boolean;
}; 