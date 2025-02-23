export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type PaymentType = 'INCOMING' | 'OUTGOING';
export type BlockchainStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'FAILED';

export interface PaymentTransaction {
  id: string;
  transactionHash?: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  blockchainStatus: BlockchainStatus;
  orderId?: string;
  orderNumber?: string;
  recipientId: string;
  recipientName: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  blockNumber?: number;
  confirmations?: number;
}

export interface SmartContractDetails {
  address: string;
  condition: string;
  status: string;
  timeout: number;
}

export interface PaymentFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  type?: PaymentType;
  status?: PaymentStatus;
  search?: string;
}

export interface PaymentStats {
  totalIncoming: number;
  totalOutgoing: number;
  pendingCount: number;
  walletBalance: number;
}

export interface InitiatePaymentData {
  type: PaymentType;
  recipientId?: string;
  recipientAddress?: string;
  amount: number;
  orderId?: string;
  enableSmartContract?: boolean;
  smartContractCondition?: string;
  smartContractTimeout?: number;
  notes?: string;
}

export interface PaymentChartData {
  date: string;
  incoming: number;
  outgoing: number;
}

export interface PaymentStatusDistribution {
  status: PaymentStatus;
  count: number;
  amount: number;
}

export interface TopEntity {
  id: string;
  name: string;
  totalAmount: number;
  transactionCount: number;
} 