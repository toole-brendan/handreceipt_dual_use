export type ShipmentType = 'INBOUND' | 'OUTBOUND';
export type ShipmentStatus = 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';
export type BlockchainStatus = 'RECORDED' | 'VERIFIED' | 'PENDING';
export type PaymentStatus = 'PAYMENT_PENDING' | 'PAYMENT_RELEASED' | 'PAYMENT_FAILED';

export interface ShipmentItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface ShipmentParty {
  id: string;
  name: string;
  address: string;
  contact: string;
}

export interface ShipmentBlockchainData {
  status: BlockchainStatus;
  transactionHash?: string;
  timestamp?: string;
  qrCode?: string;
}

export interface ShipmentPaymentData {
  status: PaymentStatus;
  amount: number;
  currency: string;
  smartContractAddress?: string;
  transactionHash?: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  type: ShipmentType;
  customer: ShipmentParty;
  supplier: ShipmentParty;
  shipmentDate: string;
  expectedDeliveryDate: string;
  status: ShipmentStatus;
  deliveryConfirmation?: {
    confirmedAt: string;
    confirmedBy: string;
    signature?: string;
  };
  items: ShipmentItem[];
  blockchain: ShipmentBlockchainData;
  payment: ShipmentPaymentData;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ShipmentFilters {
  type?: ShipmentType;
  status?: ShipmentStatus;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  search?: string;
}

export interface ShipmentStats {
  inTransit: number;
  deliveredToday: number;
  pendingConfirmation: number;
}

export interface ShipmentSummary {
  id: string;
  orderId: string;
  type: ShipmentType;
  partyName: string;
  shipmentDate: string;
  expectedDeliveryDate: string;
  status: ShipmentStatus;
  deliveryConfirmation?: {
    confirmedAt: string;
    confirmedBy: string;
  };
  blockchainStatus: BlockchainStatus;
  paymentStatus: PaymentStatus;
} 