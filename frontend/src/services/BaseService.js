import axios from 'axios';
import { ErrorHandler } from '../utils/errorHandler';

export class BaseService {
  constructor(baseURL = '/api') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptors för att hantera tokens
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Försök att förnya token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Försök göra om den ursprungliga requesten
            return this.api.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await this.api.post('/auth/refresh-token', { refreshToken });
      const { accessToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      return true;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
  }

  handleError(error, defaultMessage) {
    return ErrorHandler.handle(error, defaultMessage);
  }
} 