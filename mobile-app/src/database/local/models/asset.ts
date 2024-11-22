import { getDatabase } from '../sqlite_config';
import { DatabaseEncryption } from '../encryption';

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
  location?: string;
  lastScanned?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  encryptedData?: string;
}

export class AssetModel {
  static async create(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<Asset> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newAsset: Asset = {
      ...asset,
      id,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    if (asset.metadata) {
      newAsset.encryptedData = await DatabaseEncryption.encryptData(
        JSON.stringify(asset.metadata)
      );
    }

    const { metadata, ...assetToInsert } = newAsset;
    
    await db.executeSql(
      `INSERT INTO assets (
        id, name, type, status, location, last_scanned,
        created_at, updated_at, sync_status, encrypted_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assetToInsert.id,
        assetToInsert.name,
        assetToInsert.type,
        assetToInsert.status,
        assetToInsert.location || null,
        assetToInsert.lastScanned || null,
        assetToInsert.createdAt,
        assetToInsert.updatedAt,
        assetToInsert.syncStatus,
        assetToInsert.encryptedData || null
      ]
    );

    return newAsset;
  }

  static async findById(id: string): Promise<Asset | null> {
    const db = await getDatabase();
    const [results] = await db.executeSql(
      'SELECT * FROM assets WHERE id = ?',
      [id]
    );

    if (results.rows.length === 0) {
      return null;
    }

    const asset = results.rows.item(0);
    let metadata: Record<string, any> | undefined;

    if (asset.encrypted_data) {
      const decrypted = await DatabaseEncryption.decryptData(asset.encrypted_data);
      metadata = JSON.parse(decrypted);
    }

    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      status: asset.status,
      location: asset.location,
      lastScanned: asset.last_scanned,
      metadata,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
      syncStatus: asset.sync_status,
      encryptedData: asset.encrypted_data
    };
  }

  static async update(id: string, updates: Partial<Asset>): Promise<Asset> {
    const db = await getDatabase();
    const asset = await this.findById(id);
    
    if (!asset) {
      throw new Error(`Asset with id ${id} not found`);
    }

    const updatedAsset = { ...asset, ...updates, updatedAt: new Date().toISOString() };

    if (updates.metadata) {
      updatedAsset.encryptedData = await DatabaseEncryption.encryptData(
        JSON.stringify(updates.metadata)
      );
    }

    const { metadata, ...assetToUpdate } = updatedAsset;

    await db.executeSql(
      `UPDATE assets SET
        name = ?, type = ?, status = ?, location = ?,
        last_scanned = ?, updated_at = ?, sync_status = ?,
        encrypted_data = ?
      WHERE id = ?`,
      [
        assetToUpdate.name,
        assetToUpdate.type,
        assetToUpdate.status,
        assetToUpdate.location || null,
        assetToUpdate.lastScanned || null,
        assetToUpdate.updatedAt,
        assetToUpdate.syncStatus,
        assetToUpdate.encryptedData || null,
        id
      ]
    );

    return updatedAsset;
  }
}
