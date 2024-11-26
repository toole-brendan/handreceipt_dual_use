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
    propertyId: string;
    transferId: string;
    timestamp: number;
    signature: string;
    merkleRoot: string;
}

export interface VerificationResult {
    isValid: boolean;
    merkleProof?: string[];
    error?: string;
} 