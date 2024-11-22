import { ConnectionType } from './mesh';

export interface NetworkStatus {
    isOnline: boolean;
    connectionType: ConnectionType;
    signalStrength: number;
    lastSuccessfulSync: Date | null;
    failedAttempts: number;
}

export interface NetworkConditions {
    connectionType: ConnectionType;
    signalStrength: number;
    isOffline: boolean;
    lastSyncTimestamp: Date | null;
    failedAttempts: number;
}

export interface NetworkMetrics {
    latency: number;
    packetLoss: number;
    bandwidth: number;
    jitter: number;
}

export interface NetworkCapabilities {
    bluetooth: boolean;
    wifiDirect: boolean;
    cellular: boolean;
    nfc: boolean;
}

export enum NetworkErrorType {
    ConnectionLost = 'connection-lost',
    Timeout = 'timeout',
    InvalidResponse = 'invalid-response',
    SecurityError = 'security-error',
    PermissionDenied = 'permission-denied',
    DeviceNotSupported = 'device-not-supported'
}

export interface NetworkError {
    type: NetworkErrorType;
    message: string;
    timestamp: Date;
    details?: any;
    retryable: boolean;
}

export interface NetworkConfig {
    retryAttempts: number;
    timeoutDuration: number;
    minSignalStrength: number;
    maxLatency: number;
    batchSize: number;
    syncInterval: number;
}

export interface NetworkStats {
    totalBytesSent: number;
    totalBytesReceived: number;
    successfulTransfers: number;
    failedTransfers: number;
    averageLatency: number;
    uptime: number;
}

export interface NetworkQuality {
    score: number; // 0-100
    classification: 'excellent' | 'good' | 'fair' | 'poor';
    factors: {
        signalStrength: number;
        latency: number;
        stability: number;
        bandwidth: number;
    };
}

export interface NetworkSecurityConfig {
    encryptionEnabled: boolean;
    minSecurityLevel: string;
    requireAuthentication: boolean;
    allowUntrustedPeers: boolean;
    certificateValidation: boolean;
}

export interface NetworkRoute {
    source: string;
    destination: string;
    hopCount: number;
    latency: number;
    reliability: number;
    lastUpdated: Date;
}

export interface NetworkEvent {
    type: string;
    timestamp: Date;
    details: any;
    severity: 'info' | 'warning' | 'error';
    source: string;
}

export interface NetworkHealthCheck {
    status: 'healthy' | 'degraded' | 'offline';
    lastCheck: Date;
    issues: NetworkError[];
    metrics: NetworkMetrics;
}

export interface NetworkPriority {
    level: number; // 1-5
    maxRetries: number;
    timeoutMultiplier: number;
    requiresAcknowledgement: boolean;
}

export interface NetworkThrottling {
    enabled: boolean;
    maxConcurrentTransfers: number;
    transferDelay: number;
    maxBandwidthUtilization: number;
}

export interface NetworkCache {
    enabled: boolean;
    maxAge: number;
    maxSize: number;
    priority: 'speed' | 'consistency';
}

export interface NetworkBackoff {
    initialDelay: number;
    maxDelay: number;
    multiplier: number;
    jitter: boolean;
}

export interface NetworkMonitoring {
    enabled: boolean;
    sampleInterval: number;
    metricsRetention: number;
    alertThresholds: {
        latency: number;
        packetLoss: number;
        signalStrength: number;
    };
}
