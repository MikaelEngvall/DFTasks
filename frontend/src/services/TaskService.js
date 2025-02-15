// Ny service-layer för att hantera task-relaterad logik
import { BaseService } from './BaseService';
import { TaskModel } from "../models/TaskModel";

export class TaskService extends BaseService {
  constructor() {
    super('/api/tasks');
  }

  async getTasks(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await this.api.get(`?${params}`);
      return response.data.map(task => new TaskModel(task));
    } catch (error) {
      return this.handleError(error, 'error.tasks.fetch');
    }
  }

  async getTask(id) {
    try {
      const response = await this.api.get(`/${id}`);
      return new TaskModel(response.data);
    } catch (error) {
      return this.handleError(error, 'error.task.fetch');
    }
  }

  async createTask(taskData) {
    try {
      const response = await this.api.post('', taskData);
      return new TaskModel(response.data);
    } catch (error) {
      return this.handleError(error, 'error.task.create');
    }
  }

  async updateTask(id, taskData) {
    try {
      const response = await this.api.patch(`/${id}`, taskData);
      return new TaskModel(response.data);
    } catch (error) {
      return this.handleError(error, 'error.task.update');
    }
  }

  async deleteTask(id) {
    try {
      await this.api.delete(`/${id}`);
      return true;
    } catch (error) {
      return this.handleError(error, 'error.task.delete');
    }
  }

  async updateStatus(id, status) {
    try {
      const response = await this.api.patch(`/${id}/status`, { status });
      return new TaskModel(response.data);
    } catch (error) {
      return this.handleError(error, 'error.task.status.update');
    }
  }

  async addComment(taskId, comment) {
    try {
      const response = await this.api.post(`/${taskId}/comments`, { content: comment });
      return new TaskModel(response.data);
    } catch (error) {
      return this.handleError(error, 'error.task.comment.add');
    }
  }
}

export default new TaskService(); 