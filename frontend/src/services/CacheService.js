export class CacheService {
  constructor(options = {}) {
    this.storage = options.storage || localStorage;
    this.prefix = options.prefix || 'app_cache_';
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minuter
  }

  async set(key, data, ttl = this.defaultTTL) {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl
    };

    try {
      await this.storage.setItem(
        this.prefix + key,
        JSON.stringify(cacheItem)
      );
      return true;
    } catch (error) {
      console.error('Cache write error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      const item = await this.storage.getItem(this.prefix + key);
      if (!item) return null;

      const cacheItem = JSON.parse(item);
      const now = Date.now();

      if (now - cacheItem.timestamp > cacheItem.ttl) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async remove(key) {
    try {
      await this.storage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  }

  async clear() {
    try {
      const keys = await this.keys();
      await Promise.all(keys.map(key => this.remove(key)));
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  async keys() {
    try {
      return Object.keys(this.storage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.slice(this.prefix.length));
    } catch (error) {
      console.error('Cache keys error:', error);
      return [];
    }
  }
}

const cacheServiceInstance = new CacheService();
export default cacheServiceInstance; 