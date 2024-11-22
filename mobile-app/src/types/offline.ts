import { Transfer, TransferStatus } from './transfer';
import { NetworkConditions } from './network';
import { Peer } from './mesh';

export interface OfflineState {
    isOffline: boolean;
    lastOnlineTimestamp: Date | null;
    pendingTransfers: number;
    failedTransfers: number;
    queueSize: number;
    storageUsed: number;
    lastSyncAttempt: Date | null;
}

export interface OfflineTransfer extends Transfer {
    queuedAt: number;
    retryCount: number;
    lastRetry?: number;
    priority: OfflinePriority;
    networkConditions: NetworkConditions;
    syncAttempts: SyncAttempt[];
    error?: OfflineError;
}

export enum OfflinePriority {
    Critical = 4,
    High = 3,
    Medium = 2,
    Low = 1
}

export interface SyncAttempt {
    timestamp: Date;
    status: SyncStatus;
    peer?: Peer;
    error?: OfflineError;
    networkConditions: NetworkConditions;
}

export enum SyncStatus {
    Pending = 'pending',
    InProgress = 'in-progress',
    Completed = 'completed',
    Failed = 'failed',
    Cancelled = 'cancelled'
}

export interface OfflineError {
    code: OfflineErrorCode;
    message: string;
    timestamp: Date;
    retryable: boolean;
    details?: any;
}

export enum OfflineErrorCode {
    StorageFull = 'storage-full',
    QueueFull = 'queue-full',
    ValidationFailed = 'validation-failed',
    EncryptionFailed = 'encryption-failed',
    NetworkUnavailable = 'network-unavailable',
    SyncFailed = 'sync-failed',
    PeerUnavailable = 'peer-unavailable',
    Timeout = 'timeout'
}

export interface OfflineConfig {
    maxQueueSize: number;
    maxStorageSize: number;
    minBatteryLevel: number;
    syncInterval: number;
    retryDelays: number[];
    maxRetryAttempts: number;
    priorityThresholds: {
        critical: number;
        high: number;
        medium: number;
    };
}

export interface OfflineStats {
    totalQueued: number;
    totalProcessed: number;
    totalFailed: number;
    averageProcessingTime: number;
    storageUtilization: number;
    queueUtilization: number;
    successRate: number;
}

export interface OfflineStorage {
    available: number;
    used: number;
    reserved: number;
    temporary: number;
}

export interface QueueStats {
    size: number;
    byPriority: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    byStatus: {
        [key in TransferStatus]: number;
    };
    averageWaitTime: number;
}

export interface SyncResult {
    success: boolean;
    transfersProcessed: number;
    transfersFailed: number;
    duration: number;
    timestamp: Date;
    errors: OfflineError[];
    networkConditions: NetworkConditions;
}

export interface OfflineEvent {
    type: OfflineEventType;
    timestamp: Date;
    data: any;
    error?: OfflineError;
}

export enum OfflineEventType {
    QueueUpdated = 'queue-updated',
    SyncStarted = 'sync-started',
    SyncCompleted = 'sync-completed',
    SyncFailed = 'sync-failed',
    StorageWarning = 'storage-warning',
    QueueWarning = 'queue-warning',
    TransferQueued = 'transfer-queued',
    TransferProcessed = 'transfer-processed',
    TransferFailed = 'transfer-failed'
}

export interface OfflineValidation {
    isValid: boolean;
    canQueue: boolean;
    hasStorage: boolean;
    batteryOk: boolean;
    errors: OfflineError[];
    warnings: string[];
}

export interface OfflineRetryStrategy {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    multiplier: number;
    jitter: boolean;
    priorityMultipliers: {
        [key in OfflinePriority]: number;
    };
}

export interface OfflineCleanupConfig {
    maxAge: number;
    maxFailedAttempts: number;
    minPriority: OfflinePriority;
    preserveEvidence: boolean;
}

export type OfflineEventHandler = (event: OfflineEvent) => void;
export type OfflineErrorHandler = (error: OfflineError) => void;
