const DB_NAME = 'TalesAppStorage';
const DB_VERSION = 1;
const STORE_NAME = 'appState';
const STATE_KEY = 'currentState';

class StorageManager {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  async saveState(pages, availableImages, settings) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const stateData = {
        pages,
        availableImages,
        settings,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      return new Promise((resolve, reject) => {
        const request = store.put(stateData, STATE_KEY);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {

      // Fallback to localStorage for settings only (without images)
      try {
        const lightState = {
          settings,
          timestamp: Date.now(),
          version: '1.0'
        };
        localStorage.setItem('tales_settings_backup', JSON.stringify(lightState));
      } catch (fallbackError) {

      }
    }
  }

  async loadState() {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get(STATE_KEY);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.pages && result.availableImages) {
            resolve({
              pages: result.pages || [],
              availableImages: result.availableImages || [],
              settings: result.settings || null,
              timestamp: result.timestamp,
              version: result.version
            });
          } else {
            // Try fallback from localStorage
            this.loadFromLocalStorageFallback().then(resolve).catch(() => resolve(null));
          }
        };
      });
    } catch (error) {

      // Try fallback from localStorage
      return this.loadFromLocalStorageFallback();
    }
  }

  async loadFromLocalStorageFallback() {
    try {
      const settingsData = localStorage.getItem('tales_settings_backup');
      if (settingsData) {
        const parsed = JSON.parse(settingsData);
        return {
          pages: [],
          availableImages: [],
          settings: parsed.settings || null,
          timestamp: parsed.timestamp,
          version: parsed.version
        };
      }
    } catch (error) {

    }
    return null;
  }

  async clearState() {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(STATE_KEY);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {

    }
    
    // Also clear localStorage fallback
    try {
      localStorage.removeItem('tales_settings_backup');
    } catch (error) {

    }
  }

  async getStorageSize() {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get(STATE_KEY);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            const sizeBytes = new Blob([JSON.stringify(result)]).size;
            const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
            resolve({ bytes: sizeBytes, mb: sizeMB });
          } else {
            resolve({ bytes: 0, mb: '0.00' });
          }
        };
      });
    } catch (error) {

      return { bytes: 0, mb: '0.00' };
    }
  }
}

// Create singleton instance
const storageManager = new StorageManager();

// Export utility functions
export const saveAppState = (pages, availableImages, settings) => {
  return storageManager.saveState(pages, availableImages, settings);
};

export const loadAppState = () => {
  return storageManager.loadState();
};

export const clearAppState = () => {
  return storageManager.clearState();
};

export const getStorageSize = () => {
  return storageManager.getStorageSize();
};

// Debounced save function to avoid excessive writes
let saveTimeout = null;
export const debouncedSaveAppState = (pages, availableImages, settings, delay = 1000) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveAppState(pages, availableImages, settings);
  }, delay);
};