import { ConnectionType } from './mesh';

export enum TransferStatus {
  Pending = 'pending',
  WitnessRequired = 'witness-required',
  Confirmed = 'confirmed',
  Rejected = 'rejected',
  Synced = 'synced',
  Failed = 'failed'
}

export enum TransferPriority {
  High = 3,
  Medium = 2,
  Low = 1
}

export enum VerificationMethod {
  QRCode = 'qr-code',
  NFCTag = 'nfc-tag',
  ManualEntry = 'manual-entry',
  BiometricConfirmation = 'biometric'
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  classification: string;
  location: string;
  custodian: string;
  status: AssetStatus;
  lastUpdated: Date;
  metadata: AssetMetadata;
}

export enum AssetStatus {
  Active = 'active',
  InTransit = 'in-transit',
  Maintenance = 'maintenance',
  Decommissioned = 'decommissioned'
}

export interface AssetMetadata {
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  warrantyExpiration?: Date;
  maintenanceSchedule?: MaintenanceSchedule;
  customFields?: Record<string, any>;
}

export interface MaintenanceSchedule {
  lastMaintenance: Date;
  nextMaintenance: Date;
  interval: number; // in days
  type: string;
}

export interface Transfer {
  id: string;
  assetId: string;
  fromUserId: string;
  toUserId: string;
  timestamp: Date;
  status: TransferStatus;
  classification: string;
  verificationMethod: VerificationMethod;
  signatures: Signature[];
  metadata: TransferMetadata;
  networkConditions: NetworkConditions;
}

export interface Signature {
  userId: string;
  signature: string;
  timestamp: Date;
  deviceId: string;
}

export interface TransferMetadata {
  reason?: string;
  location?: string;
  witnesses?: string[];
  requiredWitnesses: number;
  customFields?: Record<string, any>;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  userId: string;
  deviceId: string;
  location?: string;
  details?: string;
}

export interface NetworkConditions {
  connectionType: ConnectionType;
  signalStrength: number;
  isOffline: boolean;
  lastSyncTimestamp: Date | null;
  failedAttempts: number;
}

export interface TransferValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  requiredActions: RequiredAction[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
}

export interface RequiredAction {
  type: string;
  message: string;
  data?: any;
}

export interface TransferQueue {
  addToQueue(transfer: Transfer): Promise<boolean>;
  removeFromQueue(transferId: string): Promise<boolean>;
  getQueue(): Promise<Transfer[]>;
  clearQueue(): Promise<void>;
  updateTransferStatus(transferId: string, status: TransferStatus): Promise<boolean>;
  getStats(): Promise<QueueStats>;
}

export interface QueueStats {
  totalItems: number;
  pendingItems: number;
  failedItems: number;
  lastSync: Date | null;
}

export interface TransferResult {
  success: boolean;
  transferId: string;
  status: TransferStatus;
  timestamp: Date;
  error?: string;
  details?: {
    confirmationCode?: string;
    witnesses?: string[];
    location?: string;
  };
}

export interface TransferOptions {
  priority?: TransferPriority;
  timeout?: number;
  retryAttempts?: number;
  requireWitnesses?: boolean;
  minSignalStrength?: number;
  verificationMethod?: VerificationMethod;
  customMetadata?: Record<string, any>;
}
