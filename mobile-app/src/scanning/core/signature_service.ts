import { NativeModules } from 'react-native';
import CryptoJS from 'crypto-js';

interface SignatureData {
  assetId: string;
  scanData: Record<string, any>;
  timestamp: string;
}

export class SignatureService {
  private static readonly HASH_ALGORITHM = 'SHA-256';

  async generateSignature(data: SignatureData): Promise<string> {
    try {
      // Create a deterministic string representation of the data
      const dataString = this.serializeData(data);
      
      // Generate hash
      const hash = CryptoJS.SHA256(dataString);
      
      // Convert to hex string
      return hash.toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error('Failed to generate signature:', error);
      throw error;
    }
  }

  async verifySignature(data: SignatureData, signature: string): Promise<boolean> {
    try {
      const expectedSignature = await this.generateSignature(data);
      return expectedSignature === signature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  private serializeData(data: SignatureData): string {
    // Sort keys to ensure consistent serialization
    const ordered: Record<string, any> = {};
    Object.keys(data).sort().forEach(key => {
      ordered[key] = data[key];
    });
    
    return JSON.stringify(ordered);
  }
}

