interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class DataCache {
  private storage: Storage;
  private prefix: string;

  constructor(storage: Storage = localStorage, prefix = 'cache_') {
    this.storage = storage;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      await this.storage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await this.storage.getItem(this.getKey(key));
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      const now = Date.now();

      if (now - cacheItem.timestamp > cacheItem.ttl) {
        await this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.storage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(this.storage).filter(key => 
        key.startsWith(this.prefix)
      );
      
      await Promise.all(keys.map(key => this.storage.removeItem(key)));
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export default new DataCache(); 