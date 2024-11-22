import { Asset } from './transfer';

export enum ConnectionType {
  Bluetooth = 'bluetooth',
  WifiDirect = 'wifi-direct',
  Cellular = 'cellular',
  Wifi = 'wifi',
  None = 'none'
}

export enum PeerStatus {
  Available = 'available',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Failed = 'failed',
  Syncing = 'syncing',
  AwaitingVerification = 'awaiting-verification'
}

export enum NetworkStrength {
  Strong = 'strong',    // -50 dBm or better
  Good = 'good',       // -60 dBm to -50 dBm
  Fair = 'fair',       // -70 dBm to -60 dBm
  Poor = 'poor',       // -80 dBm to -70 dBm
  VeryPoor = 'very-poor' // Worse than -80 dBm
}

export interface Peer {
  id: string;
  name: string;
  type: ConnectionType;
  status: PeerStatus;
  signalStrength: number;
  lastSeen: Date;
  capabilities: string[];
  securityLevel?: string;
  version?: string;
}

export interface MeshNode {
  id: string;
  address: string;
  lastSeen: Date;
  capabilities: string[];
  status: PeerStatus;
  version: string;
  networkStrength: number;
  securityLevel?: string;
  connectedPeers: string[];
}

export interface SyncState {
  lastSync: Date | null;
  syncInProgress: boolean;
  pendingTransfers: number;
  failedTransfers: number;
  lastError: string | null;
  networkStatus: NetworkStatus;
}

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: ConnectionType;
  signalStrength: number;
  lastSuccessfulSync: Date | null;
  failedAttempts: number;
}

export interface MeshConfig {
  maxRetryAttempts: number;
  syncInterval: number;
  batchSize: number;
  minSignalStrength: number;
  timeoutDuration: number;
  encryptionEnabled: boolean;
}

export interface MeshEvent {
  type: MeshEventType;
  timestamp: Date;
  data: any;
  peer?: Peer;
  error?: Error;
}

export enum MeshEventType {
  PeerDiscovered = 'peer-discovered',
  PeerLost = 'peer-lost',
  SyncStarted = 'sync-started',
  SyncCompleted = 'sync-completed',
  SyncFailed = 'sync-failed',
  TransferQueued = 'transfer-queued',
  TransferStarted = 'transfer-started',
  TransferCompleted = 'transfer-completed',
  TransferFailed = 'transfer-failed',
  ConnectionStateChanged = 'connection-state-changed'
}

export interface MeshError extends Error {
  code: MeshErrorCode;
  peer?: Peer;
  transfer?: Asset;
  timestamp: Date;
  retryable: boolean;
}

export enum MeshErrorCode {
  BluetoothUnavailable = 'bluetooth-unavailable',
  WifiDirectUnavailable = 'wifi-direct-unavailable',
  PermissionDenied = 'permission-denied',
  ConnectionFailed = 'connection-failed',
  SyncError = 'sync-error',
  SecurityError = 'security-error',
  QueueFull = 'queue-full',
  InvalidPeer = 'invalid-peer',
  Timeout = 'timeout'
}

export interface MeshStats {
  connectedPeers: number;
  availablePeers: number;
  averageSignalStrength: number;
  successfulTransfers: number;
  failedTransfers: number;
  lastSyncDuration: number;
  queueSize: number;
  networkType: ConnectionType;
  batteryLevel: number;
  storageUsed: number;
}

export interface MeshConnection {
  peer: Peer;
  startTime: Date;
  endTime?: Date;
  bytesTransferred: number;
  transferCount: number;
  errors: MeshError[];
  averageSignalStrength: number;
  status: PeerStatus;
}

export interface MeshSyncResult {
  success: boolean;
  timestamp: Date;
  duration: number;
  transfersCompleted: number;
  transfersFailed: number;
  bytesTransferred: number;
  errors: MeshError[];
  peers: Peer[];
}

export type MeshEventHandler = (event: MeshEvent) => void;

export type MeshErrorHandler = (error: MeshError) => void;

export interface MeshNetworkOptions {
  maxPeers?: number;
  autoConnect?: boolean;
  requireEncryption?: boolean;
  minSignalStrength?: number;
  scanInterval?: number;
  syncInterval?: number;
  retryAttempts?: number;
  timeoutDuration?: number;
  batchSize?: number;
}
