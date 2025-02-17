import { PharmaceuticalProduct } from './pharmaceuticals-products.mock';
import { PharmaceuticalLocation } from './pharmaceuticals-locations.mock';

export interface ShipmentItem {
  productId: string;
  batchNumber: string;
  quantity: number;
  unit: string;
}

export interface ShipmentCondition {
  timestamp: string;
  temperature: number;
  humidity: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'Normal' | 'Warning' | 'Critical';
  notes?: string;
}

export interface PharmaceuticalShipment {
  id: string;
  referenceNumber: string;
  type: 'Domestic' | 'International' | 'Internal Transfer';
  priority: 'Standard' | 'Express' | 'Critical';
  status: 'Preparing' | 'In Transit' | 'Delivered' | 'Delayed' | 'Cancelled';
  fromLocationId: string;
  toLocationId: string;
  carrier: {
    name: string;
    trackingNumber?: string;
    vehicleId?: string;
    driverName?: string;
  };
  items: ShipmentItem[];
  conditions: ShipmentCondition[];
  expectedDeparture: string;
  actualDeparture?: string;
  expectedArrival: string;
  actualArrival?: string;
  temperature: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  humidity: {
    min: number;
    max: number;
    unit: '%';
  };
  blockchainData: {
    transactionHash: string;
    blockNumber: number;
    timestamp: string;
    verified: boolean;
  };
  documents: {
    id: string;
    type: string;
    name: string;
    url: string;
    verified: boolean;
  }[];
}

export const mockPharmaceuticalShipments: PharmaceuticalShipment[] = [
  {
    id: 'SHP001',
    referenceNumber: 'SHIP-2024-001',
    type: 'Internal Transfer',
    priority: 'Standard',
    status: 'Delivered',
    fromLocationId: 'WH001',
    toLocationId: 'MFG001',
    carrier: {
      name: 'Internal Logistics',
      vehicleId: 'VEH001',
      driverName: 'Robert Brown'
    },
    items: [
      {
        productId: 'API001',
        batchNumber: 'ACET-2024-001',
        quantity: 100,
        unit: 'kg'
      }
    ],
    conditions: [
      {
        timestamp: '2024-02-10T09:00:00Z',
        temperature: 22.5,
        humidity: 45,
        status: 'Normal'
      },
      {
        timestamp: '2024-02-10T10:00:00Z',
        temperature: 22.8,
        humidity: 46,
        status: 'Normal'
      }
    ],
    expectedDeparture: '2024-02-10T09:00:00Z',
    actualDeparture: '2024-02-10T09:15:00Z',
    expectedArrival: '2024-02-10T10:00:00Z',
    actualArrival: '2024-02-10T10:05:00Z',
    temperature: {
      min: 20,
      max: 25,
      unit: 'C'
    },
    humidity: {
      min: 35,
      max: 55,
      unit: '%'
    },
    blockchainData: {
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: 12345678,
      timestamp: '2024-02-10T09:15:05Z',
      verified: true
    },
    documents: [
      {
        id: 'DOC001',
        type: 'Transfer Form',
        name: 'Internal Transfer Form #ITF-2024-001',
        url: '/documents/ITF-2024-001.pdf',
        verified: true
      }
    ]
  },
  {
    id: 'SHP002',
    referenceNumber: 'SHIP-2024-002',
    type: 'Domestic',
    priority: 'Express',
    status: 'In Transit',
    fromLocationId: 'MFG001',
    toLocationId: 'DC001',
    carrier: {
      name: 'PharmaExpress Logistics',
      trackingNumber: 'PEL123456789',
      vehicleId: 'PEL-TRUCK-001',
      driverName: 'James Wilson'
    },
    items: [
      {
        productId: 'FD001',
        batchNumber: 'PAW-2024-001',
        quantity: 50000,
        unit: 'tablets'
      }
    ],
    conditions: [
      {
        timestamp: '2024-02-14T08:00:00Z',
        temperature: 21.5,
        humidity: 43,
        location: {
          latitude: 35.7796,
          longitude: -78.6382
        },
        status: 'Normal'
      },
      {
        timestamp: '2024-02-14T09:00:00Z',
        temperature: 23.1,
        humidity: 44,
        location: {
          latitude: 35.8283,
          longitude: -78.6421
        },
        status: 'Warning',
        notes: 'Temperature approaching upper limit'
      }
    ],
    expectedDeparture: '2024-02-14T08:00:00Z',
    actualDeparture: '2024-02-14T08:10:00Z',
    expectedArrival: '2024-02-14T12:00:00Z',
    temperature: {
      min: 20,
      max: 25,
      unit: 'C'
    },
    humidity: {
      min: 35,
      max: 55,
      unit: '%'
    },
    blockchainData: {
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 12345679,
      timestamp: '2024-02-14T08:10:05Z',
      verified: true
    },
    documents: [
      {
        id: 'DOC002',
        type: 'Bill of Lading',
        name: 'BOL #BOL-2024-002',
        url: '/documents/BOL-2024-002.pdf',
        verified: true
      },
      {
        id: 'DOC003',
        type: 'Temperature Log',
        name: 'Temperature Log #TL-2024-002',
        url: '/documents/TL-2024-002.pdf',
        verified: true
      }
    ]
  }
];

export const getShipmentById = (id: string): PharmaceuticalShipment | undefined => {
  return mockPharmaceuticalShipments.find(shipment => shipment.id === id);
};

export const getShipmentsByStatus = (status: PharmaceuticalShipment['status']): PharmaceuticalShipment[] => {
  return mockPharmaceuticalShipments.filter(shipment => shipment.status === status);
};

export const getShipmentsByLocation = (locationId: string): PharmaceuticalShipment[] => {
  return mockPharmaceuticalShipments.filter(
    shipment => shipment.fromLocationId === locationId || shipment.toLocationId === locationId
  );
};

export const getShipmentsByProduct = (productId: string): PharmaceuticalShipment[] => {
  return mockPharmaceuticalShipments.filter(
    shipment => shipment.items.some(item => item.productId === productId)
  );
};

export const getActiveShipments = (): PharmaceuticalShipment[] => {
  return mockPharmaceuticalShipments.filter(
    shipment => shipment.status === 'In Transit' || shipment.status === 'Preparing'
  );
};

export const getShipmentsByDateRange = (startDate: string, endDate: string): PharmaceuticalShipment[] => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return mockPharmaceuticalShipments.filter(shipment => {
    const shipmentDate = new Date(shipment.expectedDeparture).getTime();
    return shipmentDate >= start && shipmentDate <= end;
  });
};
