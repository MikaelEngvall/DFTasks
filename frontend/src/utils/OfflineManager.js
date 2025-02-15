import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';

class OfflineManager {
  constructor() {
    this.dbPromise = this.initializeDB();
    this.syncInProgress = false;
  }

  async initializeDB() {
    return openDB('offline-store', 1, {
      upgrade(db) {
        // Lagra offline-åtgärder
        db.createObjectStore('pendingActions', {
          keyPath: 'id',
          autoIncrement: true,
        });

        // Cache för offline-data
        db.createObjectStore('offlineData', {
          keyPath: 'key',
        });
      },
    });
  }

  async saveOfflineAction(action) {
    const db = await this.dbPromise;
    const tx = db.transaction('pendingActions', 'readwrite');
    await tx.store.add({
      id: uuidv4(),
      timestamp: Date.now(),
      action,
      status: 'pending'
    });
    
    // Registrera för bakgrundssynkronisering
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-pending-tasks');
    }
  }

  async getPendingActions() {
    const db = await this.dbPromise;
    return db.getAll('pendingActions');
  }

  async processPendingActions() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const actions = await this.getPendingActions();
      for (const action of actions) {
        try {
          await this.processAction(action);
          await this.markActionComplete(action.id);
        } catch (error) {
          console.error('Failed to process action:', error);
          await this.markActionFailed(action.id, error);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  async processAction(action) {
    // Implementera specifik logik för olika typer av åtgärder
    switch (action.type) {
      case 'CREATE_TASK':
        return this.processCreateTask(action.payload);
      case 'UPDATE_TASK':
        return this.processUpdateTask(action.payload);
      case 'DELETE_TASK':
        return this.processDeleteTask(action.payload);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  async cacheData(key, data) {
    const db = await this.dbPromise;
    const tx = db.transaction('offlineData', 'readwrite');
    await tx.store.put({
      key,
      data,
      timestamp: Date.now()
    });
  }

  async getCachedData(key) {
    const db = await this.dbPromise;
    return db.get('offlineData', key);
  }

  async clearCache() {
    const db = await this.dbPromise;
    const tx = db.transaction('offlineData', 'readwrite');
    await tx.store.clear();
  }

  isOnline() {
    return navigator.onLine;
  }

  subscribeToConnectivity(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
    return () => {
      window.removeEventListener('online', callback);
      window.removeEventListener('offline', callback);
    };
  }
}

export default new OfflineManager(); 