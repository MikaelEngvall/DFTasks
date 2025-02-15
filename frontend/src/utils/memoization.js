export const memoize = (fn, { maxSize = 100, ttl = 5 * 60 * 1000 } = {}) => {
  const cache = new Map();
  const timestamps = new Map();

  const cleanup = () => {
    const now = Date.now();
    for (const [key, timestamp] of timestamps.entries()) {
      if (now - timestamp > ttl) {
        cache.delete(key);
        timestamps.delete(key);
      }
    }
  };

  return (...args) => {
    cleanup();

    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);

    if (cache.size >= maxSize) {
      const oldestKey = timestamps.keys().next().value;
      cache.delete(oldestKey);
      timestamps.delete(oldestKey);
    }

    cache.set(key, result);
    timestamps.set(key, Date.now());

    return result;
  };
};

export const asyncMemoize = (fn, options = {}) => {
  const memoized = memoize(async (...args) => {
    const result = await fn(...args);
    return result;
  }, options);

  return memoized;
}; 