import CryptoJS from 'crypto-js';
import { NativeModules } from 'react-native';
const { RNSecureStorage } = NativeModules;

export class CryptoUtil {
  private static readonly KEY_SIZE = 32; // 256 bits
  private static readonly IV_SIZE = 16; // 128 bits
  private static readonly ITERATION_COUNT = 10000;

  static async generateKey(): Promise<string> {
    const randomBytes = await RNSecureStorage.generateRandomBytes(this.KEY_SIZE);
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(randomBytes));
  }

  static async generateIV(): Promise<string> {
    const randomBytes = await RNSecureStorage.generateRandomBytes(this.IV_SIZE);
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(randomBytes));
  }

  static async encrypt(data: string, key: string): Promise<string> {
    const iv = await this.generateIV();
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Combine IV and encrypted data
    return `${iv}:${encrypted.toString()}`;
  }

  static async decrypt(encryptedData: string, key: string): Promise<string> {
    const [iv, data] = encryptedData.split(':');
    
    const decrypted = CryptoJS.AES.decrypt(data, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  static async hash(data: string): Promise<string> {
    return CryptoJS.SHA256(data).toString();
  }

  static async hmac(data: string, key: string): Promise<string> {
    return CryptoJS.HmacSHA256(data, key).toString();
  }
}
