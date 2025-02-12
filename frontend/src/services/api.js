import axiosInstance from "../utils/axios";

// Auth API
export const authAPI = {
  login: (credentials) => axiosInstance.post("/auth/login", credentials),
  forgotPassword: (email) =>
    axiosInstance.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    axiosInstance.post("/auth/reset-password", { token, password }),
};

// Tasks API
export const tasksAPI = {
  getTasks: () => axiosInstance.get("/tasks"),
  getAllTasks: () => axiosInstance.get("/tasks/all"),
  getTask: (id) => axiosInstance.get(`/tasks/${id}`),
  createTask: (taskData) => axiosInstance.post("/tasks", taskData),
  updateTaskStatus: (taskId, status) =>
    axiosInstance.patch(`/tasks/${taskId}/status`, { status }),
  toggleTaskStatus: async (taskId) =>
    axiosInstance.patch(`/tasks/${taskId}/toggle`),
  addComment: (taskId, content) =>
    axiosInstance.post(`/tasks/${taskId}/comments`, { content }),
  toggleCommentStatus: (taskId, commentId) =>
    axiosInstance.patch(`/tasks/${taskId}/comments/${commentId}/toggle`),
};

// Pending Tasks API
export const pendingTasksAPI = {
  getPendingTasks: (showArchived = false) =>
    axiosInstance.get(`/tasks/pending?showArchived=${showArchived}`),
  approvePendingTask: (taskId, data) =>
    axiosInstance.post(`/tasks/pending/${taskId}/approve`, data),
  declinePendingTask: (taskId, reason) =>
    axiosInstance.post(`/tasks/pending/${taskId}/decline`, { reason }),
};

// Users API
export const usersAPI = {
  getUsers: () => axiosInstance.get("/users"),
  getAllUsers: () => axiosInstance.get("/users/all"),
  createUser: (userData) => axiosInstance.post("/users", userData),
  updateUser: (userId, userData) =>
    axiosInstance.patch(`/users/${userId}`, userData),
  toggleUserStatus: (userId) => axiosInstance.patch(`/users/${userId}/toggle`),
};
