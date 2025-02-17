import { PharmaceuticalProduct } from './pharmaceuticals-products.mock';
import { PharmaceuticalLocation } from './pharmaceuticals-locations.mock';

export type TransactionType = 
  | 'Raw Material Receipt'
  | 'Manufacturing Start'
  | 'Manufacturing Complete'
  | 'Quality Control Test'
  | 'Batch Release'
  | 'Transfer'
  | 'Shipment Created'
  | 'Shipment Received'
  | 'Product Recall'
  | 'Inventory Adjustment';

export interface PharmaceuticalTransaction {
  id: string;
  type: TransactionType;
  timestamp: string;
  productId: string;
  fromLocationId?: string;
  toLocationId?: string;
  batchNumber?: string;
  quantity: number;
  unit: string;
  status: 'Completed' | 'Pending' | 'Failed';
  actor: {
    id: string;
    name: string;
    role: string;
  };
  blockchainData: {
    transactionHash: string;
    blockNumber: number;
    timestamp: string;
    verified: boolean;
  };
  data: {
    temperature?: number;
    humidity?: number;
    testResults?: {
      type: string;
      result: 'Pass' | 'Fail';
      parameters: Record<string, any>;
    };
    notes?: string;
    [key: string]: any;
  };
}

export const mockPharmaceuticalTransactions: PharmaceuticalTransaction[] = [
  {
    id: 'TRX001',
    type: 'Raw Material Receipt',
    timestamp: '2024-02-10T08:00:00Z',
    productId: 'API001',
    toLocationId: 'WH001',
    batchNumber: 'ACET-2024-001',
    quantity: 500,
    unit: 'kg',
    status: 'Completed',
    actor: {
      id: 'USR001',
      name: 'John Smith',
      role: 'Warehouse Manager'
    },
    blockchainData: {
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: 12345678,
      timestamp: '2024-02-10T08:00:05Z',
      verified: true
    },
    data: {
      temperature: 22.5,
      humidity: 45,
      notes: 'Visual inspection completed. All containers sealed and intact.'
    }
  },
  {
    id: 'TRX002',
    type: 'Quality Control Test',
    timestamp: '2024-02-10T10:30:00Z',
    productId: 'API001',
    fromLocationId: 'WH001',
    toLocationId: 'QC001',
    batchNumber: 'ACET-2024-001',
    quantity: 0.5,
    unit: 'kg',
    status: 'Completed',
    actor: {
      id: 'USR002',
      name: 'Sarah Johnson',
      role: 'QC Analyst'
    },
    blockchainData: {
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 12345679,
      timestamp: '2024-02-10T10:30:05Z',
      verified: true
    },
    data: {
      testResults: {
        type: 'Purity Analysis',
        result: 'Pass',
        parameters: {
          purity: 99.8,
          moisture: 0.1,
          heavyMetals: 'Not Detected'
        }
      }
    }
  },
  {
    id: 'TRX003',
    type: 'Manufacturing Start',
    timestamp: '2024-02-11T09:00:00Z',
    productId: 'FD001',
    fromLocationId: 'WH001',
    toLocationId: 'MFG001',
    batchNumber: 'PAW-2024-001',
    quantity: 100,
    unit: 'kg',
    status: 'Completed',
    actor: {
      id: 'USR003',
      name: 'Michael Chen',
      role: 'Production Supervisor'
    },
    blockchainData: {
      transactionHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      blockNumber: 12345680,
      timestamp: '2024-02-11T09:00:05Z',
      verified: true
    },
    data: {
      temperature: 21.5,
      humidity: 42,
      notes: 'Manufacturing process initiated according to SOP-MFG-001'
    }
  },
  {
    id: 'TRX004',
    type: 'Quality Control Test',
    timestamp: '2024-02-13T14:00:00Z',
    productId: 'API002',
    fromLocationId: 'MFG001',
    toLocationId: 'QC001',
    batchNumber: 'IBU-2024-001',
    quantity: 1,
    unit: 'kg',
    status: 'Completed',
    actor: {
      id: 'USR002',
      name: 'Sarah Johnson',
      role: 'QC Analyst'
    },
    blockchainData: {
      transactionHash: '0x5432109876fedcba5432109876fedcba5432109876fedcba5432109876fedcba',
      blockNumber: 12345681,
      timestamp: '2024-02-13T14:00:05Z',
      verified: true
    },
    data: {
      testResults: {
        type: 'Purity Analysis',
        result: 'Fail',
        parameters: {
          purity: 98.2,
          moisture: 0.3,
          heavyMetals: 'Detected'
        }
      },
      notes: 'Batch failed QC due to purity below specification (99.0% min)'
    }
  },
  {
    id: 'TRX005',
    type: 'Product Recall',
    timestamp: '2024-02-14T11:30:00Z',
    productId: 'API002',
    fromLocationId: 'QC001',
    batchNumber: 'IBU-2024-001',
    quantity: 200,
    unit: 'kg',
    status: 'Completed',
    actor: {
      id: 'USR004',
      name: 'David Wilson',
      role: 'Quality Assurance Manager'
    },
    blockchainData: {
      transactionHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
      blockNumber: 12345682,
      timestamp: '2024-02-14T11:30:05Z',
      verified: true
    },
    data: {
      notes: 'Batch recalled due to failed QC test. Investigation initiated.'
    }
  }
];

export const getTransactionById = (id: string): PharmaceuticalTransaction | undefined => {
  return mockPharmaceuticalTransactions.find(transaction => transaction.id === id);
};

export const getTransactionsByProduct = (productId: string): PharmaceuticalTransaction[] => {
  return mockPharmaceuticalTransactions.filter(transaction => transaction.productId === productId);
};

export const getTransactionsByType = (type: TransactionType): PharmaceuticalTransaction[] => {
  return mockPharmaceuticalTransactions.filter(transaction => transaction.type === type);
};

export const getTransactionsByLocation = (locationId: string): PharmaceuticalTransaction[] => {
  return mockPharmaceuticalTransactions.filter(
    transaction => transaction.fromLocationId === locationId || transaction.toLocationId === locationId
  );
};

export const getTransactionsByBatch = (batchNumber: string): PharmaceuticalTransaction[] => {
  return mockPharmaceuticalTransactions.filter(transaction => transaction.batchNumber === batchNumber);
};

export const getProductProvenance = (productId: string): PharmaceuticalTransaction[] => {
  return mockPharmaceuticalTransactions
    .filter(transaction => transaction.productId === productId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};
