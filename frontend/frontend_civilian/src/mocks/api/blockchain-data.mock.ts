import { PharmaceuticalProduct } from './pharmaceuticals-products.mock';

// Types for blockchain and compliance data
export interface BlockchainTransaction {
  transactionHash: string;
  timestamp: string;
  blockNumber: number;
  previousHash: string;
  eventType: 'create' | 'transfer' | 'update' | 'inspect' | 'approve' | 'reject' | 'recall';
  data: {
    productId: string;
    fromLocation?: string;
    toLocation?: string;
    handlerId: string;
    handlerRole: string;
    quantity: number;
    metadata: Record<string, any>;
  };
  signatures: {
    handler: string;
    witness?: string;
    authority?: string;
  };
  verified: boolean;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'temperature' | 'timeLimit' | 'authorization' | 'documentation' | 'quality';
  parameters: {
    min?: number;
    max?: number;
    timeLimit?: number; // in hours
    requiredSignatures?: string[];
    requiredDocuments?: string[];
  };
  severity: 'critical' | 'major' | 'minor';
}

export interface ComplianceStatus {
  productId: string;
  timestamp: string;
  ruleId: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  details: string;
  evidence?: {
    documentUrls: string[];
    sensorData?: Record<string, any>;
    signatures?: string[];
  };
}

export interface ProvenanceEvent {
  id: string;
  productId: string;
  timestamp: string;
  eventType: 'manufactured' | 'received' | 'inspected' | 'stored' | 'shipped' | 'delivered';
  location: {
    id: string;
    name: string;
    type: 'manufacturer' | 'warehouse' | 'distributor' | 'pharmacy';
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  handler: {
    id: string;
    role: string;
    organization: string;
  };
  data: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    documentRefs?: string[];
    notes?: string;
  };
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
  blockchainRef: {
    transactionHash: string;
    blockNumber: number;
  };
}

// Mock compliance rules
export const mockComplianceRules: ComplianceRule[] = [
  {
    id: 'TEMP-001',
    name: 'Temperature Control',
    description: 'Maintain product temperature within specified range',
    category: 'temperature',
    parameters: {
      min: 2,
      max: 8
    },
    severity: 'critical'
  },
  {
    id: 'TIME-001',
    name: 'Transit Time Limit',
    description: 'Maximum allowed time in transit',
    category: 'timeLimit',
    parameters: {
      timeLimit: 72 // hours
    },
    severity: 'major'
  },
  {
    id: 'AUTH-001',
    name: 'Quality Control Approval',
    description: 'Requires QC approval before release',
    category: 'authorization',
    parameters: {
      requiredSignatures: ['QC_MANAGER', 'PHARMACIST']
    },
    severity: 'critical'
  },
  {
    id: 'DOC-001',
    name: 'Required Documentation',
    description: 'Essential documents for compliance',
    category: 'documentation',
    parameters: {
      requiredDocuments: ['COA', 'MSDS', 'Import_License']
    },
    severity: 'major'
  }
];

// Mock provenance events for a product
export const mockProvenanceEvents: ProvenanceEvent[] = [
  {
    id: 'EVENT-001',
    productId: 'API001',
    timestamp: '2024-02-10T08:00:00Z',
    eventType: 'manufactured',
    location: {
      id: 'MFG001',
      name: 'PharmaChem Industries - Plant 1',
      type: 'manufacturer',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    handler: {
      id: 'EMP001',
      role: 'Production Manager',
      organization: 'PharmaChem Industries'
    },
    data: {
      temperature: 21.5,
      humidity: 45,
      documentRefs: ['COA-001', 'BATCH-001']
    },
    complianceStatus: 'compliant',
    blockchainRef: {
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: 12345678
    }
  },
  {
    id: 'EVENT-002',
    productId: 'API001',
    timestamp: '2024-02-10T10:30:00Z',
    eventType: 'inspected',
    location: {
      id: 'QC001',
      name: 'Quality Control Lab',
      type: 'manufacturer',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    handler: {
      id: 'EMP002',
      role: 'QC Manager',
      organization: 'PharmaChem Industries'
    },
    data: {
      temperature: 22.0,
      humidity: 44,
      documentRefs: ['QC-REPORT-001'],
      notes: 'All quality parameters within specification'
    },
    complianceStatus: 'compliant',
    blockchainRef: {
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 12345679
    }
  },
  {
    id: 'EVENT-003',
    productId: 'API001',
    timestamp: '2024-02-10T14:15:00Z',
    eventType: 'shipped',
    location: {
      id: 'WH001',
      name: 'Central Distribution Warehouse',
      type: 'warehouse',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    handler: {
      id: 'EMP003',
      role: 'Logistics Manager',
      organization: 'PharmaChem Industries'
    },
    data: {
      temperature: 21.8,
      humidity: 46,
      documentRefs: ['SHIP-001', 'BOL-001'],
      notes: 'Shipped via temperature-controlled transport'
    },
    complianceStatus: 'compliant',
    blockchainRef: {
      transactionHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      blockNumber: 12345680
    }
  }
];

// Mock compliance status records
export const mockComplianceStatuses: ComplianceStatus[] = [
  {
    productId: 'API001',
    timestamp: '2024-02-10T08:30:00Z',
    ruleId: 'TEMP-001',
    status: 'compliant',
    details: 'Temperature maintained between 2-8°C during manufacturing',
    evidence: {
      documentUrls: ['https://example.com/temp-log-001'],
      sensorData: {
        avgTemp: 5.2,
        minTemp: 4.8,
        maxTemp: 5.6
      }
    }
  },
  {
    productId: 'API001',
    timestamp: '2024-02-10T10:45:00Z',
    ruleId: 'AUTH-001',
    status: 'compliant',
    details: 'QC approval obtained',
    evidence: {
      documentUrls: ['https://example.com/qc-approval-001'],
      signatures: ['QC_MANAGER_001', 'PHARMACIST_001']
    }
  },
  {
    productId: 'API001',
    timestamp: '2024-02-10T14:30:00Z',
    ruleId: 'DOC-001',
    status: 'compliant',
    details: 'All required documentation present',
    evidence: {
      documentUrls: [
        'https://example.com/coa-001',
        'https://example.com/msds-001',
        'https://example.com/import-license-001'
      ]
    }
  }
];

// Helper functions
export const getProvenanceEventsForProduct = (productId: string): ProvenanceEvent[] => {
  return mockProvenanceEvents.filter(event => event.productId === productId);
};

export const getComplianceStatusForProduct = (productId: string): ComplianceStatus[] => {
  return mockComplianceStatuses.filter(status => status.productId === productId);
};

export const getComplianceRuleById = (ruleId: string): ComplianceRule | undefined => {
  return mockComplianceRules.find(rule => rule.id === ruleId);
};
