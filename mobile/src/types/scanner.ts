export interface Location {
    latitude: number;
    longitude: number;
    timestamp: string;
}

export interface ScanResult {
    id: string;
    propertyId: string;
    timestamp: string;
    signature: string;
    previousHolder: string;
    merkleRoot: string;
    location?: Location;
}

export interface ScanError {
    code: string;
    message: string;
}

export interface QRData {
    transferId: string;
    propertyId: string;
    timestamp: string;
    signature?: string;
}

export interface VerificationResult {
    isValid: boolean;
    merkleProof?: string[];
    error?: string;
}

export interface QRCameraConfig {
    enableTorch?: boolean;
    scanInterval?: number;
    showFrame?: boolean;
    frameColor?: string;
    frameSize?: number;
}

export interface Property {
    id: string;
    name: string;
    description?: string;
    status: PropertyStatus;
    qrCode?: string;
    syncStatus?: SyncStatus;
    createdAt: string;
    updatedAt: string;
}

export enum PropertyStatus {
    Available = 'AVAILABLE',
    InTransfer = 'IN_TRANSFER',
    Transferred = 'TRANSFERRED'
}

export enum SyncStatus {
    Pending = 'PENDING',
    Synced = 'SYNCED',
    Failed = 'FAILED'
} 