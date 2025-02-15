// Ny service-layer för att hantera task-relaterad logik
import { BaseService } from './BaseService';
import { TaskModel } from "../models/TaskModel";
import DataService from './DataService';
import OfflineManager from '../utils/OfflineManager';

export class TaskService extends BaseService {
  constructor() {
    super('/api/tasks');
    this.dataService = DataService;
    this.offlineManager = OfflineManager;
  }

  async getTasks(filters = {}) {
    const cacheKey = `tasks_${JSON.stringify(filters)}`;
    
    try {
      if (!this.offlineManager.isOnline()) {
        const cachedData = await this.offlineManager.getCachedData(cacheKey);
        if (cachedData) {
          return cachedData.data.map(task => new TaskModel(task));
        }
      }

      const response = await this.api.get('', { params: filters });
      const tasks = response.data.map(task => new TaskModel(task));
      
      // Cache för offline-användning
      await this.offlineManager.cacheData(cacheKey, response.data);
      
      return tasks;
    } catch (error) {
      if (!this.offlineManager.isOnline()) {
        const cachedData = await this.offlineManager.getCachedData(cacheKey);
        if (cachedData) {
          return cachedData.data.map(task => new TaskModel(task));
        }
      }
      throw error;
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
    const action = {
      type: 'CREATE_TASK',
      payload: taskData,
      execute: async () => {
        const response = await this.api.post('', taskData);
        return new TaskModel(response.data);
      }
    };

    if (!this.offlineManager.isOnline()) {
      await this.offlineManager.saveOfflineAction(action);
      // Returnera en temporär version för UI
      return new TaskModel({
        ...taskData,
        id: `temp_${Date.now()}`,
        status: 'pending_sync'
      });
    }

    return action.execute();
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

const taskServiceInstance = new TaskService();
export default taskServiceInstance; 