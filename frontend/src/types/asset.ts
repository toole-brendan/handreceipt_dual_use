// frontend/src/types/asset.ts

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: AssetStatus;
  location: string;
  assignedTo: string;
  lastVerified: string;
  classification: string;
  tokenId?: string;
  currentCustodian?: string;
  handReceiptHash?: string;
  transferHistory?: TransferRecord[];
}

export enum AssetStatus {
  Active = 'active',
  InTransit = 'in_transit',
  Maintenance = 'maintenance',
  Decommissioned = 'decommissioned',
  Deleted = 'deleted'
}

export interface TransferRecord {
  from: string;
  to: string;
  timestamp: string;
  digitalSignature: string;
  handReceiptHash: string;
}

export interface PropertyMetadata {
  name: string;
  description: string;
  serialNumber: string;
  classification: string;
  status: string;
} 