import { ApiClient } from './api/ApiClient';
import { DataCache } from '../utils/DataCache';

export abstract class BaseService<T> {
  protected apiClient: ApiClient;
  protected cache: DataCache;
  protected resourcePath: string;

  constructor(resourcePath: string) {
    this.apiClient = new ApiClient(process.env.REACT_APP_API_URL || '/api');
    this.cache = new DataCache();
    this.resourcePath = resourcePath;
  }

  protected getUrl(path = ''): string {
    return `${this.resourcePath}${path}`;
  }

  protected async fetchWithCache<R>(
    key: string,
    fetcher: () => Promise<R>,
    options: {
      ttl?: number;
      forceRefresh?: boolean;
    } = {}
  ): Promise<R> {
    const { ttl = 5 * 60 * 1000, forceRefresh = false } = options;

    if (!forceRefresh) {
      const cachedData = await this.cache.get<R>(key);
      if (cachedData) return cachedData;
    }

    const data = await fetcher();
    await this.cache.set(key, data, ttl);
    return data;
  }

  protected async optimisticUpdate<R>(
    key: string,
    updateFn: () => Promise<R>,
    rollbackData?: any
  ): Promise<R> {
    if (rollbackData) {
      await this.cache.set(key, rollbackData);
    }

    try {
      const result = await updateFn();
      await this.cache.set(key, result);
      return result;
    } catch (error) {
      if (rollbackData) {
        await this.cache.set(key, rollbackData);
      } else {
        await this.cache.delete(key);
      }
      throw error;
    }
  }

  protected handleError(error: any, defaultMessage: string): never {
    throw ErrorHandler.handle(error, defaultMessage);
  }
} 