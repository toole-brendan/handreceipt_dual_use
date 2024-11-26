export enum SyncStatus {
    PENDING = 'PENDING',
    SYNCED = 'SYNCED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    OFFLINE = 'OFFLINE'
}

export interface Transfer {
    id: string;
    propertyId: string;
    timestamp: string;
    scanData: any; // Will be ScanResult
    status: SyncStatus;
    retryCount: number;
    error?: string;
}

export interface SyncError {
    code: string;
    message: string;
    transfer?: Transfer;
} 