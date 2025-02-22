import { BaseProperty, BasePropertyStatus, BaseVerificationStatus } from '@shared/types/property/base';

export interface CivilianProperty extends BaseProperty {
  productType: string;
  supplier: string;
  quantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitPrice: number;
  blockchainId: string;
  warehouseLocation?: {
    zone: string;
    bin: string;
    shelf?: string;
  };
}

export interface ProductAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: string[];  // For select type
  defaultValue?: string | number | boolean;
}

export interface BlockchainRule {
  id: string;
  type: 'transfer' | 'payment' | 'verification';
  condition: string;
  action: string;
  smartContractTemplate?: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  attributes: ProductAttribute[];
  blockchainRules: BlockchainRule[];
  defaultReorderPoint?: number;
  defaultReorderQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseZone {
  id: string;
  name: string;
  type: 'storage' | 'processing' | 'shipping';
  capacity: number;
  currentOccupancy: number;
  temperature?: number;
  humidity?: number;
  bins: WarehouseBin[];
}

export interface WarehouseBin {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  items: string[];  // Array of item IDs
  shelves?: number;
}

// Extend base property filters for civilian-specific needs
export interface CivilianPropertyFilters {
  status?: BasePropertyStatus[];
  category?: string[];
  productType?: string[];
  supplier?: string[];
  location?: {
    zone?: string[];
    bin?: string[];
  };
  verificationStatus?: BaseVerificationStatus[];
  search?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  stockLevel?: 'all' | 'low' | 'out';
}

// Stats specific to civilian inventory
export interface CivilianPropertyStats {
  total: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
  pendingDeliveries: number;
  pendingTransfers: number;
  blockchainSynced: number;
  pendingSync: number;
}
