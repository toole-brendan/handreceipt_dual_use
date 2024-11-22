export enum SecurityClassification {
  Unclassified = 'UNCLASSIFIED',
  Confidential = 'CONFIDENTIAL',
  Secret = 'SECRET',
  TopSecret = 'TOP_SECRET'
}

export enum AssetStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Maintenance = 'MAINTENANCE',
  Deleted = 'DELETED'
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  status: string;
  rfid_tag_id?: string;
  rfid_last_scanned?: string;
  classification: SecurityClassification;
  metadata: Record<string, string>;
  signatures: CommandSignature[];
  created_at: string;
  updated_at: string;
}

export interface CommandSignature {
  signer_id: string;
  signature: string;
  timestamp: string;
  classification: SecurityClassification;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 