import { CryptoUtil } from './crypto';
import { NativeModules } from 'react-native';
const { RNSecureStorage } = NativeModules;

export class EncryptionService {
  private static readonly KEY_ALIAS = 'app_encryption_key';
  private static readonly SECURE_STORAGE_CONFIG = {
    accessible: 'AfterFirstUnlock',
    authenticateType: 'BiometryAny'
  };

  static async initialize(): Promise<void> {
    try {
      const existingKey = await this.getStoredKey();
      if (!existingKey) {
        const newKey = await CryptoUtil.generateKey();
        await this.storeKey(newKey);
      }
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw error;
    }
  }

  static async encryptData(data: string): Promise<string> {
    try {
      const key = await this.getStoredKey();
      if (!key) throw new Error('Encryption key not found');
      
      return await CryptoUtil.encrypt(data, key);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  static async decryptData(encryptedData: string): Promise<string> {
    try {
      const key = await this.getStoredKey();
      if (!key) throw new Error('Encryption key not found');
      
      return await CryptoUtil.decrypt(encryptedData, key);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  private static async getStoredKey(): Promise<string | null> {
    try {
      return await RNSecureStorage.getItem(this.KEY_ALIAS);
    } catch {
      return null;
    }
  }

  private static async storeKey(key: string): Promise<void> {
    await RNSecureStorage.setItem(
      this.KEY_ALIAS,
      key,
      this.SECURE_STORAGE_CONFIG
    );
  }
}
