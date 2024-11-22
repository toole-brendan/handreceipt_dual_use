// mobile-app/src/services/RFIDScanner.tsx

import React from 'react';
import { NativeModules, Platform } from 'react-native';
import type { RFIDScanResult } from '../types/rfid';
import { BaseScanner, ScanResult } from '../core/scanner_base';

const { RFIDModule } = NativeModules;

interface RFIDTag {
  id: string;
  type: string;
  data: string;
}

export class RFIDScanner extends BaseScanner {
  private static instance: RFIDScanner;
  private isScanning: boolean = false;

  private constructor() {
    super();
  }

  static getInstance(): RFIDScanner {
    if (!RFIDScanner.instance) {
      RFIDScanner.instance = new RFIDScanner();
    }
    return RFIDScanner.instance;
  }

  async scan(): Promise<ScanResult> {
    if (this.isScanning) {
      throw new Error('Scanner is busy');
    }

    this.isScanning = true;

    try {
      const tag = await RFIDModule.startScan();
      const location = await this.getCurrentLocation();
      
      const scanResult: ScanResult = {
        assetId: tag.id,
        scanType: 'RFID',
        timestamp: new Date().toISOString(),
        location,
        metadata: {
          tagType: tag.type,
          rawData: tag.data
        }
      };

      return scanResult;
    } finally {
      this.isScanning = false;
      await RFIDModule.stopScan();
    }
  }

  protected async validateScan(data: RFIDTag): Promise<boolean> {
    // Implement RFID-specific validation
    return !!(data && data.id && data.type);
  }

  protected async parseScanData(data: RFIDTag): Promise<Record<string, any>> {
    // Parse RFID-specific data
    return {
      tagId: data.id,
      tagType: data.type,
      rawData: data.data,
      scannedAt: new Date().toISOString()
    };
  }

  protected getScannerType(): string {
    return 'RFID';
  }
} 