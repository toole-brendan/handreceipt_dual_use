import { BaseScanner, ScanResult } from '../core/scanner_base';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';

interface BarcodeData {
  type: string;
  data: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class BarcodeScanner extends BaseScanner {
  private static instance: BarcodeScanner;
  private isScanning: boolean = false;
  private hasPermission: boolean = false;

  private constructor() {
    super();
    this.initializeCamera();
  }

  static getInstance(): BarcodeScanner {
    if (!BarcodeScanner.instance) {
      BarcodeScanner.instance = new BarcodeScanner();
    }
    return BarcodeScanner.instance;
  }

  private async initializeCamera(): Promise<void> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.hasPermission = status === 'granted';
  }

  async scan(): Promise<ScanResult> {
    if (!this.hasPermission) {
      throw new Error('Camera permission not granted');
    }

    if (this.isScanning) {
      throw new Error('Scanner is busy');
    }

    this.isScanning = true;

    try {
      return await new Promise((resolve, reject) => {
        const handleScan = async ({ type, data, bounds }: BarcodeData) => {
          try {
            const location = await this.getCurrentLocation();
            
            const scanResult: ScanResult = {
              assetId: data,
              scanType: 'BARCODE',
              timestamp: new Date().toISOString(),
              location,
              metadata: {
                type,
                bounds,
                format: type
              }
            };

            resolve(scanResult);
          } catch (error) {
            reject(error);
          }
        };

        // Implementation note: This is a placeholder for the actual scanning logic
        // In a real implementation, you would integrate with the Camera component
        // and use BarCodeScanner.scanFromCamera() or similar
      });
    } finally {
      this.isScanning = false;
    }
  }

  protected async validateScan(data: BarcodeData): Promise<boolean> {
    const validBarcodeTypes = [
      BarCodeScanner.Constants.BarCodeType.code128,
      BarCodeScanner.Constants.BarCodeType.code39,
      BarCodeScanner.Constants.BarCodeType.ean13,
      BarCodeScanner.Constants.BarCodeType.ean8
    ];
    return !!(data && data.data && validBarcodeTypes.includes(data.type));
  }

  protected async parseScanData(data: BarcodeData): Promise<Record<string, any>> {
    return {
      rawData: data.data,
      type: data.type,
      bounds: data.bounds,
      scannedAt: new Date().toISOString()
    };
  }

  protected getScannerType(): string {
    return 'BARCODE';
  }
}
