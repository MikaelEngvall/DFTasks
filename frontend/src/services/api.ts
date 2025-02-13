import axiosInstance from "../utils/axios";
import { 
  Task, 
  User, 
  APIResponse, 
  FetchTasksParams,
  UpdateTaskStatusParams,
  AddCommentParams 
} from "../types/task";

// Auth API
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export const authAPI = {
  login: (credentials: LoginCredentials): Promise<APIResponse<LoginResponse>> =>
    axiosInstance.post("/auth/login", credentials),
  
  logout: (): Promise<APIResponse<void>> =>
    axiosInstance.post("/auth/logout"),
  
  forgotPassword: (email: string): Promise<APIResponse<void>> =>
    axiosInstance.post("/auth/forgot-password", { email }),
  
  resetPassword: (data: ResetPasswordData): Promise<APIResponse<void>> =>
    axiosInstance.post("/auth/reset-password", data),
};

// Tasks API
export const tasksAPI = {
  getTasks: (showInactive?: boolean): Promise<APIResponse<Task[]>> =>
    axiosInstance.get("/tasks", { params: { showInactive } }),
  
  getAllTasks: (): Promise<APIResponse<Task[]>> =>
    axiosInstance.get("/tasks/all"),
  
  getTask: (id: string): Promise<APIResponse<Task>> =>
    axiosInstance.get(`/tasks/${id}`),
  
  createTask: (task: Partial<Task>): Promise<APIResponse<Task>> =>
    axiosInstance.post("/tasks", task),
  
  updateTaskStatus: (taskId: string, status: Task["status"]): Promise<APIResponse<Task>> =>
    axiosInstance.patch(`/tasks/${taskId}/status`, { status }),
  
  addComment: (taskId: string, content: string): Promise<APIResponse<Task>> =>
    axiosInstance.post(`/tasks/${taskId}/comments`, { content }),
  
  archiveTask: (taskId: string): Promise<APIResponse<Task>> =>
    axiosInstance.patch(`/tasks/${taskId}/archive`),
  
  toggleCommentStatus: (taskId: string, commentId: string): Promise<APIResponse<Task>> =>
    axiosInstance.patch(`/tasks/${taskId}/comments/${commentId}/toggle`),
};

// Pending Tasks API
interface PendingTaskApprovalData {
  assignedTo?: string;
  dueDate: string;
}

export const pendingTasksAPI = {
  getPendingTasks: (showArchived: boolean = false): Promise<APIResponse<Task[]>> =>
    axiosInstance.get(`/tasks/pending?showArchived=${showArchived}`),
  
  approvePendingTask: (taskId: string, data: PendingTaskApprovalData): Promise<APIResponse<Task>> =>
    axiosInstance.post(`/tasks/pending/${taskId}/approve`, data),
  
  declinePendingTask: (taskId: string, reason: string): Promise<APIResponse<void>> =>
    axiosInstance.post(`/tasks/pending/${taskId}/decline`, { reason }),
};

// Users API
interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: User["role"];
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: User["role"];
  preferredLanguage?: User["preferredLanguage"];
}

export const usersAPI = {
  getUsers: (): Promise<APIResponse<User[]>> => 
    axiosInstance.get("/users"),
  
  getAllUsers: (): Promise<APIResponse<User[]>> => 
    axiosInstance.get("/users/all"),
  
  createUser: (userData: CreateUserData): Promise<APIResponse<User>> =>
    axiosInstance.post("/users", userData),
  
  updateUser: (userId: string, userData: UpdateUserData): Promise<APIResponse<User>> =>
    axiosInstance.patch(`/users/${userId}`, userData),
  
  toggleUserStatus: (userId: string): Promise<APIResponse<User>> =>
    axiosInstance.patch(`/users/${userId}/toggle`),
}; 