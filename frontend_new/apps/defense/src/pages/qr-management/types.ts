export type QRStatus = 'PENDING' | 'SCANNED' | 'EXPIRED' | 'CANCELLED';

export type TrackingAction = 'TRANSFER' | 'UPDATE_STATUS' | 'MAINTENANCE' | 'LOST_DAMAGED';

export interface MetadataField {
  serialNumber: boolean;
  currentStatus: boolean;
  location: boolean;
  assignedUser: boolean;
  timestamp: boolean;
  conditionNotes?: string;
  customField?: {
    label: string;
    value: string;
  };
}

export interface QRCodeDetails {
  id: string;
  itemId: string;
  itemName: string;
  serialNumber: string;
  action: QRAction;
  createdDate: string;
  status: QRStatus;
  scannedDate?: string;
  blockchainTxId?: string;
  metadata: MetadataField;
}

export interface QRAction {
  type: TrackingAction;
  details: {
    recipientId?: string;
    recipientName?: string;
    newStatus?: string;
    notes?: string;
  };
}

export interface QRMetrics {
  totalGenerated: number;
  scannedToday: number;
  pending: number;
}

export interface ItemDetails {
  id: string;
  name: string;
  serialNumber: string;
  currentStatus: string;
  location: string;
  assignedTo?: string;
}

export interface GenerateQRFormData {
  itemId: string;
  actionType: TrackingAction;
  actionDetails: QRAction['details'];
  metadata: MetadataField;
} 