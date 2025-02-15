import { CacheService } from './CacheService';
import { memoize } from '../utils/memoization';

export class DataService {
  constructor() {
    this.cache = new CacheService();
    this.pendingRequests = new Map();
  }

  // Deduplicera samtidiga anrop
  async deduplicate(key, fetchFn) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = fetchFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Hämta data med caching
  async fetchWithCache(key, fetchFn, options = {}) {
    const {
      ttl,
      forceRefresh = false,
      deduplicate = true
    } = options;

    if (!forceRefresh) {
      const cachedData = await this.cache.get(key);
      if (cachedData) return cachedData;
    }

    const fetchData = async () => {
      const data = await fetchFn();
      await this.cache.set(key, data, ttl);
      return data;
    };

    return deduplicate ? 
      this.deduplicate(key, fetchData) : 
      fetchData();
  }

  // Optimistisk uppdatering
  async optimisticUpdate(key, updateFn, rollbackFn) {
    const originalData = await this.cache.get(key);
    
    try {
      const newData = await updateFn(originalData);
      await this.cache.set(key, newData);
      return newData;
    } catch (error) {
      if (originalData && rollbackFn) {
        await this.cache.set(key, originalData);
        await rollbackFn(originalData);
      }
      throw error;
    }
  }

  // Batch-operationer
  async batchOperation(keys, operation) {
    const results = await Promise.allSettled(
      keys.map(key => operation(key))
    );

    return results.reduce((acc, result, index) => {
      acc[keys[index]] = result.status === 'fulfilled' ? 
        result.value : 
        { error: result.reason };
      return acc;
    }, {});
  }

  // Prenumerera på dataändringar
  subscribe(key, callback) {
    const handler = async (event) => {
      if (event.key && event.key.startsWith(this.cache.prefix)) {
        const dataKey = event.key.slice(this.cache.prefix.length);
        if (dataKey === key) {
          const newData = await this.cache.get(key);
          callback(newData);
        }
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
}

// Memoizera instansen
export default memoize(() => new DataService())(); 