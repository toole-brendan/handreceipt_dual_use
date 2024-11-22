import { Asset, AssetModel } from '../../database/local/models/asset';
import { QueueStorage } from './queue_storage';

export class AssetStorage {
  static async createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<Asset> {
    // Create the asset locally
    const newAsset = await AssetModel.create(asset);

    // Queue the create operation for syncing
    await QueueStorage.enqueue({
      type: 'create',
      assetId: newAsset.id,
      data: asset,
      priority: QueueStorage.getPriorityForOperation('create')
    });

    return newAsset;
  }

  static async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    // Update the asset locally
    const updatedAsset = await AssetModel.update(id, {
      ...updates,
      syncStatus: 'pending'
    });

    // Queue the update operation for syncing
    await QueueStorage.enqueue({
      type: 'update',
      assetId: id,
      data: updates,
      priority: QueueStorage.getPriorityForOperation('update')
    });

    return updatedAsset;
  }

  static async getAsset(id: string): Promise<Asset | null> {
    return await AssetModel.findById(id);
  }

  static async recordScan(id: string, scanData: Record<string, any>): Promise<void> {
    const now = new Date().toISOString();
    
    // Update the asset's last scanned time
    await AssetModel.update(id, {
      lastScanned: now,
      syncStatus: 'pending'
    });

    // Queue the scan operation for syncing
    await QueueStorage.enqueue({
      type: 'scan',
      assetId: id,
      data: {
        ...scanData,
        scannedAt: now
      },
      priority: QueueStorage.getPriorityForOperation('scan')
    });
  }

  static async markAsSynced(id: string): Promise<void> {
    await AssetModel.update(id, {
      syncStatus: 'synced'
    });
  }

  static async markSyncFailed(id: string): Promise<void> {
    await AssetModel.update(id, {
      syncStatus: 'failed'
    });
  }
}
