/* frontend/src/mocks/mockData.ts */

export const mockTasks = [
  {
    id: '1',
    itemName: 'Quality Control Check - Batch ABC123',
    dateSubmitted: '2024-03-25',
    daysInProcess: 5,
    expectedCompletion: '2024-04-01',
    status: 'In Progress' as const
  },
  {
    id: '2',
    itemName: 'Stability Testing - Insulin Batch XYZ789',
    dateSubmitted: '2024-03-20',
    daysInProcess: 10,
    expectedCompletion: '2024-04-05',
    status: 'Delayed' as const
  }
];

export const mockSystemHealth = {
  network: 'healthy',
  blockchain: 'synced',
  security: 'normal',
  performance: 95
};

// Mock Entities for the pharmaceutical supply chain
export const mockEntities = {
  manufacturers: [
    {
      id: 'MFG001',
      name: 'Acme Pharmaceuticals',
      type: 'Manufacturer',
      location: {
        name: 'Manufacturing Plant Alpha',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      }
    }
  ],
  distributionCenters: [
    {
      id: 'DC001',
      name: 'Central Distribution Hub',
      type: 'Distribution',
      location: {
        name: 'Distribution Center 1',
        coordinates: { lat: 37.7833, lng: -122.4167 }
      }
    },
    {
      id: 'DC002',
      name: 'Regional Warehouse A',
      type: 'Distribution',
      location: {
        name: 'Regional Warehouse A',
        coordinates: { lat: 37.3382, lng: -121.8863 }
      }
    }
  ],
  pharmacies: [
    {
      id: 'PH001',
      name: 'City Pharmacy',
      type: 'Pharmacy',
      location: {
        name: 'Downtown Location',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      }
    },
    {
      id: 'PH002',
      name: 'Hospital Pharmacy',
      type: 'Pharmacy',
      location: {
        name: 'General Hospital',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      }
    }
  ]
};

export const mockTransactions = [
  // ... (keeping all the transactions the same)
  {
    transactionHash: '0xa1b2c3d4e5f6a1b2c3d4e5f6',
    blockNumber: 12345681,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'Quality Check Passed',
    status: 'Completed' as const,
    productId: 'INS001',
    productName: 'Insulin, Refrigerated',
    batchLotNumber: 'INS-2024-789',
    quantity: 1000,
    from: 'DC002',
    fromName: 'Regional Warehouse A',
    to: 'DC002',
    toName: 'Regional Warehouse A',
    user: 'QCInspector',
    digitalTwinId: 'DT-INS-2024-789',
    temperature: {
      min: 2.1,
      max: 2.8,
      avg: 2.4
    },
    humidity: {
      min: 44,
      max: 46,
      avg: 45
    },
    smartContractId: 'SC002',
    eventSummary: 'Quality check passed for insulin batch',
    details: {
      action: 'Quality Check',
      location: 'Distribution Center 2 - QC Lab',
      actor: 'Alice Smith (QC Inspector)',
      data: {
        'Purity': '99.9%',
        'Temperature': '2.4°C',
        'Humidity': '45%',
        'Location': 'QC Lab Room 3'
      }
    }
  },
  // ... (rest of the transactions array)
];

export const mockActivities = [
  {
    id: 'A001',
    type: 'quality-check',
    message: 'Quality control verification completed for Batch ABC-123',
    timestamp: new Date().toISOString(),
    severity: 'info',
    classification: 'GMP Compliant',
  }
];

export const mockInventoryChecks = [
  {
    id: 'ic1',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Dr. Sarah Johnson',
    type: 'Quality Control' as const,
    location: 'Cold Storage A',
    time: '09:00',
    lastCheckStatus: 'Pending' as const
  },
  {
    id: 'ic2',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Michael Chen',
    type: 'Temperature Monitoring' as const,
    location: 'Cold Storage B',
    time: '14:00',
    lastCheckStatus: 'Pending' as const
  },
  {
    id: 'ic3',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Dr. Robert Wilson',
    type: 'Stability Testing' as const,
    location: 'Quality Control Lab',
    time: '10:30',
    lastCheckStatus: 'Completed' as const,
    reportUrl: '/reports/ic3'
  }
];

export const mockProvenanceData = [
  {
    productId: 'VAX001',
    provenanceEvents: [
      {
        id: 'pe1',
        timestamp: '2024-02-01T08:00:00Z',
        location: {
          name: 'Manufacturing Plant Alpha',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        action: 'Production' as const,
        actor: {
          name: 'John Smith',
          role: 'Production Manager'
        },
        data: {
          'Batch Size': '1000 units',
          'Production Line': 'Line A',
          'Temperature': '22°C',
          'Humidity': '45%'
        },
        documents: [
          {
            name: 'Production Record',
            hash: '0x1234567890abcdef1234567890abcdef',
            url: '#'
          },
          {
            name: 'Quality Control Report',
            hash: '0xabcdef1234567890abcdef1234567890',
            url: '#'
          }
        ],
        blockchainData: {
          transactionHash: '0x9876543210fedcba9876543210fedcba',
          timestamp: '2024-02-01T08:00:00Z',
          verified: true
        }
      },
      {
        id: 'pe2',
        timestamp: '2024-02-01T10:30:00Z',
        location: {
          name: 'Quality Control Lab',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        action: 'Quality Check' as const,
        actor: {
          name: 'Sarah Johnson',
          role: 'QC Specialist'
        },
        data: {
          'Test Results': 'Pass',
          'Purity': '99.8%',
          'Compliance': 'Within Specifications'
        },
        documents: [
          {
            name: 'Certificate of Analysis',
            hash: '0x2468101214161820222426283032',
            url: '#'
          }
        ],
        blockchainData: {
          transactionHash: '0x1357911131517192123252729313',
          timestamp: '2024-02-01T10:30:00Z',
          verified: true
        }
      }
    ]
  }
];
