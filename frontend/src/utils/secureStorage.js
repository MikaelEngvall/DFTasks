import { encrypt, decrypt } from './encryption';

export class SecureStorage {
  constructor(storage = localStorage) {
    this.storage = storage;
    this.prefix = 'secure_';
  }

  setItem(key, value) {
    try {
      const encryptedValue = encrypt(JSON.stringify(value));
      this.storage.setItem(this.prefix + key, encryptedValue);
      return true;
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      return false;
    }
  }

  getItem(key) {
    try {
      const encryptedValue = this.storage.getItem(this.prefix + key);
      if (!encryptedValue) return null;

      const decryptedValue = decrypt(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  removeItem(key) {
    try {
      this.storage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
      return false;
    }
  }

  clear() {
    try {
      Object.keys(this.storage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => this.storage.removeItem(key));
      return true;
    } catch (error) {
      console.error('SecureStorage clear error:', error);
      return false;
    }
  }
}

export default new SecureStorage(); 