import type { BaseEntity } from '@/types/shared';

export type TransferType = 'incoming' | 'outgoing' | 'temporary_loan';
export type TransferPriority = 'high' | 'medium' | 'low';
export type Category = 'weapons' | 'ammunition' | 'equipment' | 'vehicles' | 'communications' | 'medical' | 'sensitive_items';
export type TransferStatus = 
  | 'pending_approval' 
  | 'awaiting_confirmation' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled';

export interface Transfer extends BaseEntity {
  id: string;
  itemName: string;
  serialNumber: string;
  type: TransferType;
  priority: TransferPriority;
  category: Category;
  status: TransferStatus;
  dateRequested: string;
  dateApproved?: string;
  dateCompleted?: string;
  dateNeeded: string;
  notes?: string;
  blockchainTxId?: string;
  qrCodeData?: string;
  otherParty: {
    name: string;
    rank: string;
    unit: string;
  };
  approver?: {
    name: string;
    rank: string;
    unit: string;
  };
}

export interface FiltersState {
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  type?: TransferType;
  priority?: TransferPriority[];
  category?: Category[];
  status?: TransferStatus[];
  personnel?: string[];
}

export interface MetricChange {
  value: string;
  timeframe: string;
  isPositive: boolean;
}

export interface MetricItem {
  value: string | number;
  change?: MetricChange;
}

export interface MetricsData {
  pendingApprovals: MetricItem;
  processingTime: MetricItem;
  completedToday: MetricItem;
  approvalRate: MetricItem;
}

export interface TransferTabData {
  pendingApprovals: Transfer[];
  awaitingConfirmations: Transfer[];
  history: Transfer[];
}

export interface InitiateTransferData {
  items: Array<{
    id: string;
    name: string;
    serialNumber: string;
    category: Category;
  }>;
  recipient: {
    id: string;
    name: string;
    rank: string;
    unit: string;
  };
  type: TransferType;
  notes?: string;
  dateNeeded: string;
} 