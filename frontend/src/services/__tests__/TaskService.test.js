import TaskService from '../TaskService';
import { TaskModel } from '../../models/TaskModel';
import DataService from '../DataService';

jest.mock('../DataService');

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch and transform tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' }
      ];

      DataService.fetchWithCache.mockResolvedValueOnce(mockTasks);

      const result = await TaskService.getTasks();
      
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(TaskModel);
      expect(result[1]).toBeInstanceOf(TaskModel);
    });

    it('should handle errors', async () => {
      const error = new Error('Network error');
      DataService.fetchWithCache.mockRejectedValueOnce(error);

      await expect(TaskService.getTasks()).rejects.toThrow('Network error');
    });
  });

  // Fler tester...
}); 