export enum SyncStatus {
    PENDING = 'PENDING',
    OFFLINE = 'OFFLINE',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
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