import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkError } from '../errors/NetworkError';
import { PersistentSyncQueue, SyncEvent, ApiClient } from './SyncQueue';
import { ConflictResolver, Versioned } from './ConflictResolver';

export interface SyncOptions {
  retryOnFailure?: boolean;
  timeout?: number;
}

export class SyncService<T extends Versioned> {
  private readonly queue: PersistentSyncQueue;
  private isProcessing = false;

  constructor(
    private readonly api: ApiClient,
    private readonly resolver: ConflictResolver<T>,
    private readonly storage: typeof AsyncStorage,
    private readonly entityName: string
  ) {
    this.queue = new PersistentSyncQueue(storage, api);
  }

  async syncEntity(entity: T, options: SyncOptions = {}): Promise<T> {
    try {
      // First try immediate sync
      const remoteEntity = await this.fetchRemote(entity.id);
      
      if (remoteEntity) {
        // Resolve any conflicts
        const resolved = this.resolver.resolve(entity, remoteEntity);
        
        if (resolved !== entity) {
          // Entity was merged/changed, save locally
          await this.saveLocal(resolved);
        }
        
        // Push to remote
        await this.pushToRemote(resolved);
        return resolved;
      } else {
        // No remote entity exists, just push
        await this.pushToRemote(entity);
        return entity;
      }
    } catch (error) {
      if (error instanceof NetworkError && options.retryOnFailure !== false) {
        // Queue for later if network error
        await this.queue.push({
          type: `SYNC_${this.entityName.toUpperCase()}`,
          payload: entity
        });
        return entity;
      }
      throw error;
    }
  }

  async startSync(options: SyncOptions = {}): Promise<void> {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      await this.queue.process();
    } finally {
      this.isProcessing = false;
    }

    // Schedule next sync if requested
    if (options.timeout) {
      setTimeout(() => this.startSync(options), options.timeout);
    }
  }

  private async fetchRemote(id: string): Promise<T | null> {
    try {
      const response = await fetch(`/api/state/${this.entityName}/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`State API error: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new NetworkError();
      }
      throw error;
    }
  }

  private async pushToRemote(entity: T): Promise<void> {
    const response = await fetch(`/api/${this.entityName}/${entity.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entity)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
  }

  private async saveLocal(entity: T): Promise<void> {
    const key = `@${this.entityName}:${entity.id}`;
    await this.storage.setItem(key, JSON.stringify(entity));
  }

  async getLocalEntity(id: string): Promise<T | null> {
    const key = `@${this.entityName}:${id}`;
    const data = await this.storage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async clearLocalStorage(): Promise<void> {
    const keys = await this.storage.getAllKeys();
    const entityKeys = keys.filter(key => key.startsWith(`@${this.entityName}:`));
    await this.storage.multiRemove(entityKeys);
  }
}
