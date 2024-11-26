import { NativeModules } from 'react-native';
import { ScanResult, QRData } from '../types/scanner';
import { Transfer } from '../types/sync';

const { HandReceiptModule } = NativeModules;

export interface HandReceiptMobile {
  // Local QR Code Operations
  scanQR(data: string): Promise<QRData>;  // Just parse the QR code locally
  
  // Local Storage Operations
  storeTransfer(transfer: Transfer): Promise<void>;
  getStoredTransfers(): Promise<Transfer[]>;
  
  // Network Operations (these will communicate with the Rust backend server)
  submitTransfer(transfer: Transfer): Promise<{
    success: boolean;
    error?: string;
  }>;
  
  syncPendingTransfers(): Promise<{
    synced: string[];
    failed: string[];
  }>;
  
  // Local Signature Verification (public key operations only)
  verifySignature(data: string, signature: string, publicKey: string): Promise<boolean>;
  
  // Initialization
  initialize(): Promise<void>;
}

export default HandReceiptModule as HandReceiptMobile; 