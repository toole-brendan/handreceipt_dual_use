import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyManager } from '../../core/crypto/KeyManager';
import { SyncService } from '../../core/sync/SyncService';
import { PropertyRecord, createPropertyMergeStrategy, MergeBasedResolver } from '../../core/sync/ConflictResolver';
import { ApiClient } from '../../core/sync/SyncQueue';
import { NetworkError } from '../../core/errors/NetworkError';
import { generateUUID } from '../../core/utils/uuid';

export interface CreatePropertyInput {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  metadata: Record<string, unknown>;
}

export class PropertyService {
  private readonly syncService: SyncService<PropertyRecord>;
  
  constructor(
    private readonly keyManager: KeyManager,
    private readonly api: ApiClient,
    private readonly storage: typeof AsyncStorage
  ) {
    const resolver = new MergeBasedResolver(createPropertyMergeStrategy());
    this.syncService = new SyncService(api, resolver, storage, 'property');
  }

  async createProperty(input: CreatePropertyInput): Promise<PropertyRecord> {
    // Create new property record
    const property: PropertyRecord = {
      id: generateUUID(),
      version: 1,
      updatedAt: new Date().toISOString(),
      ...input
    };

    // Sign the property data
    const data = new TextEncoder().encode(JSON.stringify(property));
    const signature = await this.keyManager.sign(data);

    // Add signature to metadata
    const propertyWithSignature: PropertyRecord = {
      ...property,
      metadata: {
        ...property.metadata,
        signature: Array.from(new Uint8Array(signature))
      }
    };

    // Save locally and sync
    await this.syncService.syncEntity(propertyWithSignature, {
      retryOnFailure: true
    });

    return propertyWithSignature;
  }

  async updateProperty(
    id: string,
    updates: Partial<Omit<PropertyRecord, 'id' | 'version' | 'updatedAt'>>
  ): Promise<PropertyRecord> {
    const current = await this.syncService.getLocalEntity(id);
    if (!current) {
      throw new Error('Property not found');
    }

    const updated: PropertyRecord = {
      ...current,
      ...updates,
      version: current.version + 1,
      updatedAt: new Date().toISOString()
    };

    // Sign the updated data
    const data = new TextEncoder().encode(JSON.stringify(updated));
    const signature = await this.keyManager.sign(data);

    // Update signature in metadata
    const propertyWithSignature: PropertyRecord = {
      ...updated,
      metadata: {
        ...updated.metadata,
        signature: Array.from(new Uint8Array(signature))
      }
    };

    // Save and sync
    return this.syncService.syncEntity(propertyWithSignature, {
      retryOnFailure: true
    });
  }

  async getProperty(id: string): Promise<PropertyRecord | null> {
    try {
      // Try to sync first
      const property = await this.syncService.getLocalEntity(id);
      if (!property) return null;

      await this.syncService.syncEntity(property);
      return property;
    } catch (error) {
      if (error instanceof NetworkError) {
        // Return local version if network is unavailable
        return this.syncService.getLocalEntity(id);
      }
      throw error;
    }
  }

  async verifyPropertySignature(property: PropertyRecord): Promise<boolean> {
    const signature = property.metadata.signature;
    if (!Array.isArray(signature)) {
      return false;
    }

    // Create verification data without signature
    const verificationData = {
      ...property,
      metadata: { ...property.metadata }
    };
    delete verificationData.metadata.signature;

    const data = new TextEncoder().encode(JSON.stringify(verificationData));
    const signatureBuffer = new Uint8Array(signature).buffer;

    // Get the public key (implementation depends on your key management system)
    const publicKey = await this.getPublicKeyForProperty(property);
    if (!publicKey) return false;

    return this.keyManager.verify(signatureBuffer, data, publicKey);
  }

  private async getPublicKeyForProperty(property: PropertyRecord): Promise<CryptoKey | null> {
    try {
      // Fetch the public key from API or local storage
      const keyData = await this.api.get(`/api/properties/${property.id}/key`);
      
      // Import as WebCrypto key
      return crypto.subtle.importKey(
        'jwk',
        keyData.publicKey,
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        true,
        ['verify']
      );
    } catch (error) {
      console.warn('Failed to fetch public key:', error);
      return null;
    }
  }

  async startAutoSync(intervalMs: number = 60000): Promise<void> {
    await this.syncService.startSync({
      timeout: intervalMs,
      retryOnFailure: true
    });
  }
}
