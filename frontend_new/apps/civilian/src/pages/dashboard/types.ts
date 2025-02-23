export interface DashboardSummaryCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export interface SalesData {
  date: string;
  value: number;
}

export interface TopSellingProduct {
  name: string;
  quantitySold: number;
  unit: string;
  totalRevenue: number;
}

export interface Shipment {
  id: string;
  destination: string;
  status: 'delivered' | 'in_transit' | 'delayed';
  coordinates: {
    lat: number;
    lng: number;
  };
  details: string;
}

export interface PendingPayment {
  id: string;
  recipient: string;
  amount: number;
  dueDate: string;
  isOverdue: boolean;
}

export interface LowStockItem {
  name: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
}

export interface BlockchainTransaction {
  id: string;
  date: string;
  type: 'payment' | 'inventory_update' | 'shipment_update';
  status: 'confirmed' | 'pending' | 'failed';
  details: string;
  explorerUrl: string;
}

export interface DashboardData {
  summary: {
    inventoryValue: number;
    totalSales: number;
    totalShipments: number;
    totalPayments: number;
    walletBalance: number;
  };
  salesData: SalesData[];
  topSellingProducts: TopSellingProduct[];
  recentShipments: Shipment[];
  pendingPayments: PendingPayment[];
  lowStockItems: LowStockItem[];
  recentTransactions: BlockchainTransaction[];
} 