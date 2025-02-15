import { useState, useEffect, useCallback } from 'react';
import DataService from '../services/DataService';
import { useErrorHandler } from './useErrorHandler';

export const useData = (key, fetchFn, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { handleError } = useErrorHandler();

  const {
    ttl,
    forceRefresh = false,
    deduplicate = true,
    onSuccess,
    onError,
    dependencies = []
  } = options;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await DataService.fetchWithCache(
        key,
        fetchFn,
        { ttl, forceRefresh, deduplicate }
      );

      setData(result);
      onSuccess?.(result);
    } catch (error) {
      const handledError = await handleError(error);
      setError(handledError);
      onError?.(handledError);
    } finally {
      setLoading(false);
    }
  }, [key, ...dependencies]);

  useEffect(() => {
    fetchData();

    const unsubscribe = DataService.subscribe(key, (newData) => {
      setData(newData);
    });

    return () => unsubscribe();
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const update = useCallback(async (updateFn, rollbackFn) => {
    try {
      const newData = await DataService.optimisticUpdate(key, updateFn, rollbackFn);
      setData(newData);
      return newData;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [key, handleError]);

  return {
    data,
    loading,
    error,
    refresh,
    update
  };
}; 