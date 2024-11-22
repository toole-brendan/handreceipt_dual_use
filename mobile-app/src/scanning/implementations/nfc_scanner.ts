import { BaseScanner, ScanResult } from '../core/scanner_base';
import NfcManager, { NfcTech, TagEvent } from 'react-native-nfc-manager';

interface NFCTag {
  id: string;
  techTypes: string[];
  data: Record<string, any>;
}

export class NFCScanner extends BaseScanner {
  private static instance: NFCScanner;
  private isScanning: boolean = false;

  private constructor() {
    super();
    this.initializeNFC();
  }

  static getInstance(): NFCScanner {
    if (!NFCScanner.instance) {
      NFCScanner.instance = new NFCScanner();
    }
    return NFCScanner.instance;
  }

  private async initializeNFC(): Promise<void> {
    const isSupported = await NfcManager.isSupported();
    if (isSupported) {
      await NfcManager.start();
    } else {
      throw new Error('NFC not supported on this device');
    }
  }

  async scan(): Promise<ScanResult> {
    if (this.isScanning) {
      throw new Error('Scanner is busy');
    }

    this.isScanning = true;

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag: TagEvent = await NfcManager.getTag();
      const location = await this.getCurrentLocation();

      if (!tag) {
        throw new Error('Failed to read NFC tag');
      }

      const scanResult: ScanResult = {
        assetId: tag.id,
        scanType: 'NFC',
        timestamp: new Date().toISOString(),
        location,
        metadata: {
          techTypes: tag.techTypes,
          data: tag.ndefMessage
        }
      };

      return scanResult;
    } finally {
      this.isScanning = false;
      await NfcManager.cancelTechnologyRequest();
    }
  }

  protected async validateScan(tag: NFCTag): Promise<boolean> {
    return !!(tag && tag.id && tag.techTypes.length > 0);
  }

  protected async parseScanData(tag: NFCTag): Promise<Record<string, any>> {
    return {
      tagId: tag.id,
      techTypes: tag.techTypes,
      data: tag.data,
      scannedAt: new Date().toISOString()
    };
  }

  protected getScannerType(): string {
    return 'NFC';
  }
}
