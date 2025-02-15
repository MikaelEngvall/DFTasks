import { useState, useEffect, useCallback } from 'react';
import OfflineManager from '../utils/OfflineManager';

export const useOffline = (options = {}) => {
  const {
    onOnline,
    onOffline,
    syncOnReconnect = true
  } = options;

  const [isOnline, setIsOnline] = useState(OfflineManager.isOnline());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleConnectivityChange = (online) => {
      setIsOnline(online);
      if (online) {
        onOnline?.();
        if (syncOnReconnect) {
          syncOfflineData();
        }
      } else {
        onOffline?.();
      }
    };

    return OfflineManager.subscribeToConnectivity(handleConnectivityChange);
  }, [onOnline, onOffline, syncOnReconnect]);

  const syncOfflineData = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await OfflineManager.processPendingActions();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  const saveOfflineAction = useCallback(async (action) => {
    if (isOnline) {
      // Om online, utför direkt
      return action.execute();
    } else {
      // Annars spara för senare synkronisering
      return OfflineManager.saveOfflineAction(action);
    }
  }, [isOnline]);

  const getCachedData = useCallback(async (key) => {
    return OfflineManager.getCachedData(key);
  }, []);

  const cacheData = useCallback(async (key, data) => {
    return OfflineManager.cacheData(key, data);
  }, []);

  return {
    isOnline,
    isSyncing,
    saveOfflineAction,
    syncOfflineData,
    getCachedData,
    cacheData
  };
}; 