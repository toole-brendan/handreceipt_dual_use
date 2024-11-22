// mobile-app/src/scanning/core/scanner_base.ts

import { Geolocation } from '@react-native-community/geolocation';

export interface ScanResult {
  assetId: string;
  scanType: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  metadata?: Record<string, any>;
  signature?: string;
}

export abstract class BaseScanner {
  protected isScanning: boolean = false;

  abstract scan(): Promise<ScanResult>;
  protected abstract validateScan(data: any): Promise<boolean>;
  protected abstract parseScanData(data: any): Promise<Record<string, any>>;
  protected abstract getScannerType(): string;

  protected async getCurrentLocation(): Promise<ScanResult['location'] | undefined> {
    try {
      return await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          reject,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });
    } catch (error) {
      console.warn('Failed to get location:', error);
      return undefined;
    }
  }
}

