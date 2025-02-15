import { BaseService } from './BaseService';
import secureStorage from '../utils/secureStorage';
import SecurityService from './SecurityService';

export class AuthService extends BaseService {
  constructor() {
    super('/api/auth');
    this.securityService = SecurityService;
  }

  async login(credentials) {
    try {
      const sanitizedCredentials = {
        email: this.securityService.sanitizeInput(credentials.email),
        password: credentials.password // Lösenord behöver inte saniteras
      };

      const response = await this.api.post('/login', sanitizedCredentials);
      const { token, user } = response.data;

      // Spara token säkert
      secureStorage.setItem('auth_token', token);
      secureStorage.setItem('user', user);

      return { token, user };
    } catch (error) {
      return this.handleError(error, 'error.auth.login');
    }
  }

  async logout() {
    try {
      await this.api.post('/logout');
      secureStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getAuthToken() {
    return secureStorage.getItem('auth_token');
  }

  getUser() {
    return secureStorage.getItem('user');
  }

  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  }
}

export default new AuthService(); 