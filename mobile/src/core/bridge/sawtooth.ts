import { NativeModules } from 'react-native';
import type { MerkleProof, TransactionPayload, NetworkStatus } from '../types/sawtooth';
import { Platform } from 'react-native';

interface SawtoothBridge {
    // Transaction Management
    submitTransaction(payload: TransactionPayload): Promise<string>;
    queueTransaction(payload: TransactionPayload): Promise<string>;
    getPendingTransactions(): Promise<Array<{
        id: string;
        payload: TransactionPayload;
        status: string;
    }>>;
    
    // State Management
    getState(address: string): Promise<Uint8Array | null>;
    verifyState(proof: MerkleProof): Promise<boolean>;
    
    // Network Management
    setNetworkStatus(status: NetworkStatus): Promise<void>;
    syncPendingTransactions(): Promise<string[]>;
    
    // Key Management
    generateKey(): Promise<string>;
    importKey(key: string): Promise<void>;
    signTransaction(txId: string): Promise<string>;
}

const { SawtoothModule } = NativeModules;

if (!SawtoothModule) {
    throw new Error('Sawtooth native module is not available');
}

// For emulator development
const EMULATOR_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost'
});

const REST_API_URL = __DEV__ 
  ? `http://${EMULATOR_HOST}:8008`
  : 'http://blockchain:8008';

export class SawtoothService {
    private bridge: SawtoothBridge = SawtoothModule;

    async submitTransfer(payload: TransactionPayload): Promise<string> {
        try {
            const txId = await this.bridge.queueTransaction(payload);
            await this.bridge.signTransaction(txId);
            return txId;
        } catch (error) {
            console.error('Failed to submit transfer:', error);
            throw error;
        }
    }

    async syncPending(): Promise<string[]> {
        try {
            return await this.bridge.syncPendingTransactions();
        } catch (error) {
            console.error('Failed to sync pending transactions:', error);
            throw error;
        }
    }

    async verifyStateProof(proof: MerkleProof): Promise<boolean> {
        try {
            return await this.bridge.verifyState(proof);
        } catch (error) {
            console.error('Failed to verify state proof:', error);
            throw error;
        }
    }

    async updateNetworkStatus(status: NetworkStatus): Promise<void> {
        try {
            await this.bridge.setNetworkStatus(status);
        } catch (error) {
            console.error('Failed to update network status:', error);
            throw error;
        }
    }
}

export default new SawtoothService(); 