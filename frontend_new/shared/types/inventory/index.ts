export type InventoryCategory = 'RAW_MATERIALS' | 'WORK_IN_PROGRESS' | 'FINISHED_GOODS';
export type InventoryStatus = 'IN_STOCK' | 'RESERVED' | 'IN_TRANSIT' | 'OUT_OF_STOCK';
export type BlockchainVerificationStatus = 'VERIFIED' | 'PENDING' | 'FAILED';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  location: string;
  status: InventoryStatus;
  roastDate?: string | null;
  bestByDate: string;
  blockchainStatus: BlockchainVerificationStatus;
  transactionHash?: string;
  description?: string;
  supplier?: string;
  origin?: string;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiringSoon: number;
}

export interface InventoryFilters {
  search?: string;
  category?: InventoryCategory;
  status?: InventoryStatus;
  location?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  date: string;
  action: string;
  location: string;
  notes?: string;
  quantity: number;
  transactionHash?: string;
}

export interface InventoryChartData {
  categoryDistribution: {
    category: InventoryCategory;
    count: number;
    value: number;
  }[];
  locationDistribution: {
    location: string;
    count: number;
    percentage: number;
  }[];
  valueOverTime: {
    date: string;
    value: number;
  }[];
  stockStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface NewInventoryItemData {
  name: string;
  sku?: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  location: string;
  roastDate?: string;
  bestByDate: string;
  supplier?: string;
  certifications: string[];
  description?: string;
  createDigitalTwin: boolean;
} 