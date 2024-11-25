import { NativeModules, NativeEventEmitter } from 'react-native';
import { ScanResult } from '../types/scanner';
import { SyncStatus } from '../types/sync';

const { HandReceiptModule } = NativeModules;

// Create event emitter for native events
const eventEmitter = new NativeEventEmitter(HandReceiptModule);

export const HandReceiptMobile = {
    // Core functionality
    initialize: (): Promise<void> => HandReceiptModule.initialize(),
    
    // Camera controls
    startCamera: (): Promise<void> => HandReceiptModule.startCamera(),
    stopCamera: (): Promise<void> => HandReceiptModule.stopCamera(),
    
    // QR code scanning
    scanQR: (data: string): Promise<ScanResult> => HandReceiptModule.scanQRCode(data),
    
    // Transfer verification
    verifyTransfer: (scanResult: ScanResult): Promise<boolean> => 
        HandReceiptModule.verifyTransferData(JSON.stringify(scanResult)),
    
    // Sync management
    syncTransfers: (): Promise<void> => HandReceiptModule.syncTransfers(),

    // Event listeners
    addQRDetectionListener: (callback: (result: ScanResult) => void) => {
        return eventEmitter.addListener('onQRCodeDetected', callback);
    },

    addSyncStatusListener: (callback: (status: { id: string; status: SyncStatus }) => void) => {
        return eventEmitter.addListener('onSyncStatusChanged', callback);
    },

    addErrorListener: (callback: (error: { code: string; message: string }) => void) => {
        return eventEmitter.addListener('onError', callback);
    }
}; 