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
    location?: Location;
}

export interface ScanError {
    code: string;
    message: string;
} 