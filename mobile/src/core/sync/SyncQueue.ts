import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkError } from '../errors/NetworkError';
import { generateUUID } from '../utils/uuid';

export interface SyncEvent {
  id: string;
  type: string;
  payload: unknown;
  timestamp: string;
  retryCount: number;
}

export interface ApiClient {
  sync(event: SyncEvent): Promise<void>;
}

export interface SyncQueue {
  push(event: Omit<SyncEvent, 'id' | 'timestamp' | 'retryCount'>): Promise<void>;
  process(): Promise<void>;
  clear(): Promise<void>;
  getEvents(): Promise<SyncEvent[]>;
}

export class PersistentSyncQueue implements SyncQueue {
  private static readonly STORAGE_KEY = '@HandReceipt:sync_queue';
  private static readonly MAX_RETRIES = 3;

  constructor(
    private readonly storage: typeof AsyncStorage,
    private readonly api: ApiClient
  ) {}

  async push(event: Omit<SyncEvent, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queue = await this.getEvents();
    
    const newEvent: SyncEvent = {
      ...event,
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    queue.push(newEvent);
    await this.storage.setItem(PersistentSyncQueue.STORAGE_KEY, JSON.stringify(queue));
  }

  async process(): Promise<void> {
    const queue = await this.getEvents();
    const failedEvents: SyncEvent[] = [];

    for (const event of queue) {
      try {
        await this.api.sync(event);
      } catch (error) {
        if (error instanceof NetworkError) {
          // Network error - retry later
          if (event.retryCount < PersistentSyncQueue.MAX_RETRIES) {
            failedEvents.push({
              ...event,
              retryCount: event.retryCount + 1
            });
          }
          // If max retries reached, drop the event
          continue;
        }
        
        // Other errors - log and continue
        console.error('Sync error for event', event.id, error);
      }
    }

    // Update queue with only failed events
    await this.storage.setItem(
      PersistentSyncQueue.STORAGE_KEY,
      JSON.stringify(failedEvents)
    );
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(PersistentSyncQueue.STORAGE_KEY);
  }

  async getEvents(): Promise<SyncEvent[]> {
    const data = await this.storage.getItem(PersistentSyncQueue.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}

// Helper to create a type-safe event
export function createSyncEvent<T>(
  type: string,
  payload: T
): Omit<SyncEvent, 'id' | 'timestamp' | 'retryCount'> {
  return {
    type,
    payload
  };
}
