export type OrderType = 'purchase' | 'sales';

export type OrderStatus = 
  | 'placed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled'
  | 'received';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'escrow' | 'released';

export type BlockchainStatus = 'pending' | 'confirmed' | 'failed';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  type: OrderType;
  orderNumber: string;
  supplierOrCustomer: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  blockchainStatus: BlockchainStatus;
  items: OrderItem[];
  smartContract?: {
    address: string;
    status: 'pending' | 'active' | 'completed' | 'disputed';
    transactionHash: string;
  };
}

export interface OrderSummary {
  openPurchaseOrders: number;
  openSalesOrders: number;
  totalValueOfOpenOrders: number;
  ordersAwaitingShipment: number;
}

export interface OrderFilters {
  type: OrderType;
  status: OrderStatus | 'all';
  dateRange: {
    start: string;
    end: string;
  };
  searchQuery: string;
} 