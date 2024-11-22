import { QueueStorage } from '../storage/queue_storage';
import { AssetStorage } from '../storage/asset_storage';
import { Operation } from '../../database/local/models/operation';
import NetInfo from '@react-native-community/netinfo';

export class SyncManager {
  private static instance: SyncManager;
  private isRunning: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private readonly BATCH_SIZE = 10;

  private constructor() {}

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async startSync(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.syncInterval = setInterval(
      () => this.syncBatch(),
      this.SYNC_INTERVAL
    );

    // Run initial sync
    await this.syncBatch();
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
  }

  private async syncBatch(): Promise<void> {
    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        console.log('No network connection, skipping sync');
        return;
      }

      const operations = await QueueStorage.getNextBatch(this.BATCH_SIZE);
      
      for (const operation of operations) {
        try {
          await this.processOperation(operation);
        } catch (error) {
          console.error(`Failed to process operation ${operation.id}:`, error);
          await QueueStorage.markAsFailed(operation.id);
        }
      }

      // Cleanup old completed operations
      await QueueStorage.cleanupCompletedOperations();
      
    } catch (error) {
      console.error('Sync batch failed:', error);
    }
  }

  private async processOperation(operation: Operation): Promise<void> {
    await QueueStorage.markAsProcessing(operation.id);

    try {
      switch (operation.type) {
        case 'create':
          await this.handleCreateOperation(operation);
          break;
        case 'update':
          await this.handleUpdateOperation(operation);
          break;
        case 'scan':
          await this.handleScanOperation(operation);
          break;
        case 'transfer':
          await this.handleTransferOperation(operation);
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      await QueueStorage.markAsCompleted(operation.id);
      if (operation.assetId) {
        await AssetStorage.markAsSynced(operation.assetId);
      }
    } catch (error) {
      throw error; // Let the caller handle the error
    }
  }

  private async handleCreateOperation(operation: Operation): Promise<void> {
    // Implementation will depend on your API client
    // await apiClient.createAsset(operation.data);
  }

  private async handleUpdateOperation(operation: Operation): Promise<void> {
    // await apiClient.updateAsset(operation.assetId!, operation.data);
  }

  private async handleScanOperation(operation: Operation): Promise<void> {
    // await apiClient.recordScan(operation.assetId!, operation.data);
  }

  private async handleTransferOperation(operation: Operation): Promise<void> {
    // await apiClient.transferAsset(operation.assetId!, operation.data);
  }
}
