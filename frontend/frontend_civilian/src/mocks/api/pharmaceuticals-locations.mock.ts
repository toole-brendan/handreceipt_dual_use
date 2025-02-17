export interface PharmaceuticalLocation {
  id: string;
  name: string;
  type: 'Manufacturing Plant' | 'Warehouse' | 'Quality Control Lab' | 'Distribution Center';
  address: string;
  capacity: {
    total: number;
    used: number;
    unit: string;
  };
  temperature: {
    current: number;
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  humidity: {
    current: number;
    min: number;
    max: number;
    unit: '%';
  };
  certifications: string[];
  status: 'Operational' | 'Maintenance' | 'Shutdown' | 'Alert';
  lastInspectionDate: string;
  securityLevel: 'High' | 'Medium' | 'Standard';
}

export const mockPharmaceuticalLocations: PharmaceuticalLocation[] = [
  {
    id: 'MFG001',
    name: 'Manufacturing Plant - API Production',
    type: 'Manufacturing Plant',
    address: '123 Pharma Way, Research Triangle Park, NC 27709',
    capacity: {
      total: 10000,
      used: 6500,
      unit: 'kg'
    },
    temperature: {
      current: 22.5,
      min: 20,
      max: 25,
      unit: 'C'
    },
    humidity: {
      current: 45,
      min: 35,
      max: 55,
      unit: '%'
    },
    certifications: ['FDA GMP', 'ISO 9001:2015', 'WHO GMP'],
    status: 'Operational',
    lastInspectionDate: '2024-01-15',
    securityLevel: 'High'
  },
  {
    id: 'QC001',
    name: 'Quality Control Lab',
    type: 'Quality Control Lab',
    address: '124 Pharma Way, Research Triangle Park, NC 27709',
    capacity: {
      total: 1000,
      used: 450,
      unit: 'samples'
    },
    temperature: {
      current: 21.0,
      min: 20,
      max: 23,
      unit: 'C'
    },
    humidity: {
      current: 40,
      min: 35,
      max: 45,
      unit: '%'
    },
    certifications: ['ISO/IEC 17025', 'FDA Registered', 'USP Certified'],
    status: 'Operational',
    lastInspectionDate: '2024-01-20',
    securityLevel: 'High'
  },
  {
    id: 'WH001',
    name: 'Warehouse - Raw Materials',
    type: 'Warehouse',
    address: '200 Storage Blvd, Research Triangle Park, NC 27709',
    capacity: {
      total: 50000,
      used: 32000,
      unit: 'kg'
    },
    temperature: {
      current: 19.5,
      min: 15,
      max: 25,
      unit: 'C'
    },
    humidity: {
      current: 42,
      min: 30,
      max: 50,
      unit: '%'
    },
    certifications: ['FDA Registered', 'ISO 9001:2015'],
    status: 'Alert',
    lastInspectionDate: '2024-01-10',
    securityLevel: 'Medium'
  },
  {
    id: 'WH002',
    name: 'Warehouse - Packaging Materials',
    type: 'Warehouse',
    address: '202 Storage Blvd, Research Triangle Park, NC 27709',
    capacity: {
      total: 100000,
      used: 85000,
      unit: 'units'
    },
    temperature: {
      current: 21.0,
      min: 15,
      max: 30,
      unit: 'C'
    },
    humidity: {
      current: 48,
      min: 30,
      max: 60,
      unit: '%'
    },
    certifications: ['FDA Registered', 'ISO 9001:2015'],
    status: 'Operational',
    lastInspectionDate: '2024-01-12',
    securityLevel: 'Medium'
  },
  {
    id: 'DC001',
    name: 'Distribution Center - East Coast',
    type: 'Distribution Center',
    address: '500 Logistics Park, Raleigh, NC 27601',
    capacity: {
      total: 75000,
      used: 45000,
      unit: 'units'
    },
    temperature: {
      current: 20.5,
      min: 15,
      max: 25,
      unit: 'C'
    },
    humidity: {
      current: 45,
      min: 35,
      max: 55,
      unit: '%'
    },
    certifications: ['FDA Registered', 'ISO 9001:2015', 'GDP Certified'],
    status: 'Operational',
    lastInspectionDate: '2024-01-25',
    securityLevel: 'High'
  }
];

export const getLocationById = (id: string): PharmaceuticalLocation | undefined => {
  return mockPharmaceuticalLocations.find(location => location.id === id);
};

export const getLocationsByType = (type: PharmaceuticalLocation['type']): PharmaceuticalLocation[] => {
  return mockPharmaceuticalLocations.filter(location => location.type === type);
};

export const getLocationsByStatus = (status: PharmaceuticalLocation['status']): PharmaceuticalLocation[] => {
  return mockPharmaceuticalLocations.filter(location => location.status === status);
};

export const getLocationCapacityUtilization = (id: string): number | undefined => {
  const location = getLocationById(id);
  if (!location) return undefined;
  return (location.capacity.used / location.capacity.total) * 100;
};
