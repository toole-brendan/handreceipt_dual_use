import { Image, ImageEditor } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export class ImageProcessor {
  static async processForScanning(imageUri: string): Promise<ProcessedImage> {
    try {
      // Optimize image for scanning
      const result = await manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024 } },
          { normalize: true },
          { sharpen: 0.5 }
        ],
        {
          compress: 0.8,
          format: SaveFormat.JPEG,
          base64: true
        }
      );

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        base64: result.base64
      };
    } catch (error) {
      console.error('Image processing failed:', error);
      throw error;
    }
  }

  static async enhanceQRCode(imageUri: string): Promise<ProcessedImage> {
    try {
      // Apply QR code specific enhancements
      const result = await manipulateAsync(
        imageUri,
        [
          { contrast: 1.2 },
          { brightness: 1.1 },
          { sharpen: 1 }
        ],
        {
          format: SaveFormat.PNG,
          base64: true
        }
      );

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        base64: result.base64
      };
    } catch (error) {
      console.error('QR enhancement failed:', error);
      throw error;
    }
  }
}
