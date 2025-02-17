export interface PharmaceuticalProduct {
  id: string;
  name: string;
  sku: string;
  category: 'API' | 'Excipient' | 'Raw Material' | 'Finished Drug' | 'Packaging Material';
  description: string;
  unitOfMeasure: string;
  batchNumber?: string;
  expiryDate?: string;
  manufacturer: string;
  storageConditions: string;
  status: 'In Stock' | 'Low Stock' | 'Quarantined' | 'Approved' | 'Rejected' | 'Expired' | 'Recalled' | 'Archived';
  quantity: number;
  unitCost: number;  // Cost per unit
  location: string;
  blockchainData: {
    transactionHash: string;
    timestamp: string;
    verified: boolean;
  };
}

export const mockPharmaceuticalProducts: PharmaceuticalProduct[] = [
  {
    id: 'API001',
    name: 'Acetaminophen API',
    sku: 'API-ACET-500',
    category: 'API',
    description: 'Active Pharmaceutical Ingredient for pain relief medications',
    unitOfMeasure: 'kg',
    batchNumber: 'ACET-2024-001',
    expiryDate: '2026-02-14',
    manufacturer: 'PharmaChem Industries',
    storageConditions: 'Store below 25°C in airtight containers',
    status: 'In Stock',
    quantity: 500,
    unitCost: 150.00,  // $150 per kg
    location: 'Manufacturing Plant - API Production',
    blockchainData: {
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      timestamp: '2024-02-14T12:00:00Z',
      verified: true
    }
  },
  {
    id: 'EXC001',
    name: 'Lactose Monohydrate',
    sku: 'EXC-LACT-100',
    category: 'Excipient',
    description: 'Common pharmaceutical excipient used as a filler in tablet formulations',
    unitOfMeasure: 'kg',
    batchNumber: 'LACT-2024-001',
    expiryDate: '2025-12-31',
    manufacturer: 'ExcipientCo Ltd',
    storageConditions: 'Store in a cool, dry place',
    status: 'Approved',
    quantity: 1000,
    unitCost: 25.00,  // $25 per kg
    location: 'Warehouse - Raw Materials',
    blockchainData: {
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: '2024-02-10T09:30:00Z',
      verified: true
    }
  },
  {
    id: 'FD001',
    name: 'PainAway Extra Strength Tablets',
    sku: 'FD-PAIN-500',
    category: 'Finished Drug',
    description: 'Extra strength pain relief tablets, 500mg Acetaminophen',
    unitOfMeasure: 'tablets',
    batchNumber: 'PAW-2024-001',
    expiryDate: '2025-06-30',
    manufacturer: 'PharmaCo Global',
    storageConditions: 'Store below 25°C, protect from light and moisture',
    status: 'Quarantined',
    quantity: 100000,
    unitCost: 0.15,  // $0.15 per tablet
    location: 'Quality Control Lab',
    blockchainData: {
      transactionHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      timestamp: '2024-02-13T15:45:00Z',
      verified: true
    }
  },
  {
    id: 'PKG001',
    name: 'Blister Packaging Material',
    sku: 'PKG-BLIST-001',
    category: 'Packaging Material',
    description: 'Aluminum-PVC blister packaging for tablet products',
    unitOfMeasure: 'sheets',
    manufacturer: 'PackagingPro Industries',
    storageConditions: 'Store in a clean, dry environment',
    status: 'Low Stock',
    quantity: 5000,
    unitCost: 0.05,  // $0.05 per sheet
    location: 'Warehouse - Packaging Materials',
    blockchainData: {
      transactionHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
      timestamp: '2024-02-12T10:15:00Z',
      verified: true
    }
  },
  {
    id: 'API002',
    name: 'Ibuprofen API',
    sku: 'API-IBU-400',
    category: 'API',
    description: 'Active Pharmaceutical Ingredient for anti-inflammatory medications',
    unitOfMeasure: 'kg',
    batchNumber: 'IBU-2024-001',
    expiryDate: '2026-01-15',
    manufacturer: 'PharmaChem Industries',
    storageConditions: 'Store below 30°C in airtight containers',
    status: 'Rejected',
    quantity: 200,
    unitCost: 180.00,  // $180 per kg
    location: 'Quality Control Lab',
    blockchainData: {
      transactionHash: '0x5432109876fedcba5432109876fedcba5432109876fedcba5432109876fedcba',
      timestamp: '2024-02-11T14:20:00Z',
      verified: true
    }
  }
];

export const getProductById = (id: string): PharmaceuticalProduct | undefined => {
  return mockPharmaceuticalProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category: PharmaceuticalProduct['category']): PharmaceuticalProduct[] => {
  return mockPharmaceuticalProducts.filter(product => product.category === category);
};

export const getProductsByStatus = (status: PharmaceuticalProduct['status']): PharmaceuticalProduct[] => {
  return mockPharmaceuticalProducts.filter(product => product.status === status);
};

export const getProductsByLocation = (location: string): PharmaceuticalProduct[] => {
  return mockPharmaceuticalProducts.filter(product => product.location === location);
};
