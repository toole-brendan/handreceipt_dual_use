export interface Asset {
  id: string;
  name: string;
  description: string;
  status: AssetStatus;
  classification: string;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
  last_verified?: string;
  verification_count?: number;
}

export enum AssetStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
  Archived = 'ARCHIVED',
  Deleted = 'DELETED',
}

export interface TransferMetadata {
  previous_owner?: string;
  transfer_location?: string;
  notes?: string;
  [key: string]: any;
} 