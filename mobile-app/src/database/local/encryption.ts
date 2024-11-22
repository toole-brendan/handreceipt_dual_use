import { NativeModules } from 'react-native';
import CryptoJS from 'crypto-js';

const { RNSecureStorage } = NativeModules;

export class DatabaseEncryption {
  private static readonly KEY_ALIAS = 'db_encryption_key';
  private static readonly ITERATION_COUNT = 10000;
  
  static async generateEncryptionKey(): Promise<string> {
    const randomBytes = await RNSecureStorage.generateRandomBytes(32);
    const key = CryptoJS.lib.WordArray.random(32).toString();
    
    // Store the key securely
    await this.storeEncryptionKey(key);
    
    return key;
  }
  
  static async storeEncryptionKey(key: string): Promise<void> {
    await RNSecureStorage.setItem(this.KEY_ALIAS, key, {
      accessible: 'AfterFirstUnlock',
      authenticateType: 'BiometryAny'
    });
  }
  
  static async getEncryptionKey(): Promise<string> {
    try {
      return await RNSecureStorage.getItem(this.KEY_ALIAS);
    } catch (error) {
      console.error('Failed to retrieve encryption key:', error);
      throw error;
    }
  }
  
  static async encryptData(data: string): Promise<string> {
    const key = await this.getEncryptionKey();
    return CryptoJS.AES.encrypt(data, key).toString();
  }
  
  static async decryptData(encryptedData: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
