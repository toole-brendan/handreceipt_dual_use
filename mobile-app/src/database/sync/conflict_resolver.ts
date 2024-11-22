import { Asset } from '../local/models/asset';
import { Operation } from '../local/models/operation';
import { DatabaseEncryption } from '../local/encryption';

export enum ConflictResolutionStrategy {
  LOCAL_WINS = 'LOCAL_WINS',
  REMOTE_WINS = 'REMOTE_WINS',
  LAST_MODIFIED_WINS = 'LAST_MODIFIED_WINS',
  MANUAL = 'MANUAL'
}

export interface ConflictMetadata {
  localVersion: Asset;
  remoteVersion: Asset;
  lastSyncTimestamp: string;
  conflictType: 'UPDATE' | 'DELETE' | 'CREATE';
}

export class ConflictResolver {
  private static readonly DEFAULT_STRATEGY = ConflictResolutionStrategy.LAST_MODIFIED_WINS;
  
  static async resolveConflict(
    conflict: ConflictMetadata,
    strategy: ConflictResolutionStrategy = this.DEFAULT_STRATEGY
  ): Promise<Asset> {
    switch (strategy) {
      case ConflictResolutionStrategy.LOCAL_WINS:
        return conflict.localVersion;
        
      case ConflictResolutionStrategy.REMOTE_WINS:
        return conflict.remoteVersion;
        
      case ConflictResolutionStrategy.LAST_MODIFIED_WINS:
        return this.resolveByTimestamp(conflict);
        
      case ConflictResolutionStrategy.MANUAL:
        // Store the conflict for manual resolution
        await this.storeConflictForManualResolution(conflict);
        throw new Error('Manual conflict resolution required');
        
      default:
        throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
    }
  }

  private static async resolveByTimestamp(conflict: ConflictMetadata): Promise<Asset> {
    const localTime = new Date(conflict.localVersion.updatedAt).getTime();
    const remoteTime = new Date(conflict.remoteVersion.updatedAt).getTime();
    
    return localTime > remoteTime ? conflict.localVersion : conflict.remoteVersion;
  }

  private static async storeConflictForManualResolution(conflict: ConflictMetadata): Promise<void> {
    const encryptedConflict = await DatabaseEncryption.encryptData(
      JSON.stringify(conflict)
    );
    
    // Store in conflicts table for later resolution
    const db = await getDatabase();
    await db.executeSql(
      `INSERT INTO conflicts (
        asset_id,
        conflict_data,
        created_at,
        status
      ) VALUES (?, ?, ?, ?)`,
      [
        conflict.localVersion.id,
        encryptedConflict,
        new Date().toISOString(),
        'pending'
      ]
    );
  }

  static async detectConflicts(
    localAsset: Asset,
    remoteAsset: Asset,
    lastSync: string
  ): Promise<ConflictMetadata | null> {
    const localModified = new Date(localAsset.updatedAt) > new Date(lastSync);
    const remoteModified = new Date(remoteAsset.updatedAt) > new Date(lastSync);
    
    if (localModified && remoteModified) {
      return {
        localVersion: localAsset,
        remoteVersion: remoteAsset,
        lastSyncTimestamp: lastSync,
        conflictType: 'UPDATE'
      };
    }
    
    return null;
  }

  static async applyResolution(
    resolution: Asset,
    conflict: ConflictMetadata
  ): Promise<void> {
    // Create a new operation to apply the resolution
    await OperationModel.create({
      type: 'update',
      assetId: resolution.id,
      data: resolution,
      priority: QueueStorage.HIGH_PRIORITY
    });
  }
}
