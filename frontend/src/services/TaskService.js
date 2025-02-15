// Ny service-layer för att hantera task-relaterad logik
import { BaseService } from './BaseService';
import { TaskModel } from "../models/TaskModel";
import DataService from './DataService';

export class TaskService extends BaseService {
  constructor() {
    super('/api/tasks');
    this.dataService = DataService;
  }

  async getTasks(filters = {}) {
    const cacheKey = `tasks_${JSON.stringify(filters)}`;
    
    return this.dataService.fetchWithCache(
      cacheKey,
      async () => {
        const response = await this.api.get('', { params: filters });
        return response.data.map(task => new TaskModel(task));
      },
      { ttl: 5 * 60 * 1000 } // 5 minuter
    );
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
    return this.dataService.optimisticUpdate(
      `task_${id}`,
      async (oldTask) => {
        const response = await this.api.patch(`/${id}`, taskData);
        return new TaskModel(response.data);
      },
      async (oldTask) => {
        // Rollback-funktion
        if (oldTask) {
          await this.api.patch(`/${id}`, oldTask);
        }
      }
    );
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