import { BaseService } from './BaseService';
import { CommentModel } from '../models/CommentModel';

export class CommentService extends BaseService {
  constructor() {
    super('/api/comments');
  }

  async getComments(taskId) {
    try {
      const response = await this.api.get(`/task/${taskId}`);
      return response.data.map(comment => new CommentModel(comment));
    } catch (error) {
      return this.handleError(error, 'error.comments.fetch');
    }
  }

  async addComment(taskId, content) {
    try {
      const response = await this.api.post('', {
        taskId,
        content
      });
      return new CommentModel(response.data);
    } catch (error) {
      return this.handleError(error, 'error.comment.add');
    }
  }

  async updateComment(id, content) {
    try {
      const response = await this.api.patch(`/${id}`, { content });
      return new CommentModel(response.data);
    } catch (error) {
      return this.handleError(error, 'error.comment.update');
    }
  }

  async deleteComment(id) {
    try {
      await this.api.delete(`/${id}`);
      return true;
    } catch (error) {
      return this.handleError(error, 'error.comment.delete');
    }
  }
}

export default new CommentService(); 