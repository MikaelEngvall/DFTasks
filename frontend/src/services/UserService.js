import { BaseService } from './BaseService';
import { UserModel } from '../models/UserModel';

export class UserService extends BaseService {
  constructor() {
    super('/api/users');
  }

  async authenticate(credentials) {
    try {
      const response = await this.api.post('/auth/login', credentials);
      return new UserModel(response.data.user);
    } catch (error) {
      return this.handleError(error, 'error.auth.login');
    }
  }

  async getUsers(includeInactive = false) {
    try {
      const response = await this.api.get(includeInactive ? '/all' : '');
      return response.data.map(user => new UserModel(user));
    } catch (error) {
      return this.handleError(error, 'error.users.fetch');
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await this.api.patch(`/${id}`, userData);
      return new UserModel(response.data);
    } catch (error) {
      return this.handleError(error, 'error.user.update');
    }
  }

  async toggleUserStatus(id) {
    try {
      const response = await this.api.patch(`/${id}/toggle-status`);
      return new UserModel(response.data);
    } catch (error) {
      return this.handleError(error, 'error.user.status.toggle');
    }
  }

  async saveRefreshToken(userId, refreshToken) {
    try {
      await this.api.post('/auth/refresh-token', {
        userId,
        refreshToken
      });
      return true;
    } catch (error) {
      return this.handleError(error, 'error.auth.token.save');
    }
  }

  async removeRefreshToken(userId) {
    try {
      await this.api.delete(`/auth/refresh-token/${userId}`);
      return true;
    } catch (error) {
      return this.handleError(error, 'error.auth.token.remove');
    }
  }
}

export default new UserService(); 