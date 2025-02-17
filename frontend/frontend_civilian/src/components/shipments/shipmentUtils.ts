import { PharmaceuticalShipment, ShipmentCondition } from '@/mocks/api/pharmaceuticals-shipments.mock';

export interface CreateShipmentData {
  referenceNumber: string;
  type: PharmaceuticalShipment['type'];
  priority: PharmaceuticalShipment['priority'];
  fromLocationId: string;
  toLocationId: string;
  carrier: {
    name: string;
    trackingNumber?: string;
    vehicleId?: string;
    driverName?: string;
  };
  items: {
    productId: string;
    batchNumber: string;
    quantity: number;
    unit: string;
  }[];
  temperature: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  humidity: {
    min: number;
    max: number;
  };
  expectedDeparture: string;
  expectedArrival: string;
  documents?: File[];
}

export interface UploadedDocument {
  id: string;
  type: string;
  name: string;
  url: string;
  verified: boolean;
}

export const createBlockchainTransaction = async (data: CreateShipmentData): Promise<{
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
}> => {
  // In a real application, this would interact with a blockchain network
  // For now, we'll simulate the blockchain transaction
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    transactionHash: `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`,
    blockNumber: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString()
  };
};

export const uploadDocuments = async (files: File[]): Promise<UploadedDocument[]> => {
  // In a real application, this would upload files to a storage service
  // For now, we'll simulate the upload process
  await new Promise(resolve => setTimeout(resolve, 1000));

  return files.map((file, index) => ({
    id: `DOC-${Date.now()}-${index}`,
    type: file.type,
    name: file.name,
    url: URL.createObjectURL(file), // In real app, this would be a server URL
    verified: true
  }));
};

export const createShipment = async (data: CreateShipmentData): Promise<PharmaceuticalShipment> => {
  // Create blockchain transaction
  const blockchainData = await createBlockchainTransaction(data);

  // Upload documents if provided
  const documents = data.documents 
    ? await uploadDocuments(data.documents)
    : [];

  // Create initial shipment condition
  const initialCondition: ShipmentCondition = {
    timestamp: new Date().toISOString(),
    temperature: (Number(data.temperature.min) + Number(data.temperature.max)) / 2,
    humidity: (Number(data.humidity.min) + Number(data.humidity.max)) / 2,
    status: 'Normal'
  };

  // Create the shipment record
  const shipment: PharmaceuticalShipment = {
    id: `SHP-${Date.now()}`,
    referenceNumber: data.referenceNumber,
    type: data.type,
    priority: data.priority,
    status: 'Preparing',
    fromLocationId: data.fromLocationId,
    toLocationId: data.toLocationId,
    carrier: data.carrier,
    items: data.items.map(item => ({
      ...item,
      quantity: Number(item.quantity)
    })),
    conditions: [initialCondition],
    expectedDeparture: data.expectedDeparture,
    expectedArrival: data.expectedArrival,
    temperature: {
      min: Number(data.temperature.min),
      max: Number(data.temperature.max),
      unit: data.temperature.unit
    },
    humidity: {
      min: Number(data.humidity.min),
      max: Number(data.humidity.max),
      unit: '%'
    },
    blockchainData: {
      transactionHash: blockchainData.transactionHash,
      blockNumber: blockchainData.blockNumber,
      timestamp: blockchainData.timestamp,
      verified: true
    },
    documents
  };

  return shipment;
};

export const validateShipmentData = (data: CreateShipmentData): string[] => {
  const errors: string[] = [];

  // Required fields
  if (!data.referenceNumber) errors.push('Reference number is required');
  if (!data.fromLocationId) errors.push('Origin location is required');
  if (!data.toLocationId) errors.push('Destination location is required');
  if (!data.expectedDeparture) errors.push('Expected departure is required');
  if (!data.expectedArrival) errors.push('Expected arrival is required');

  // Validate items
  if (!data.items.length) {
    errors.push('At least one item is required');
  } else {
    data.items.forEach((item, index) => {
      if (!item.productId) errors.push(`Item ${index + 1}: Product is required`);
      if (!item.batchNumber) errors.push(`Item ${index + 1}: Batch number is required`);
      if (!item.quantity) errors.push(`Item ${index + 1}: Quantity is required`);
      if (item.quantity <= 0) errors.push(`Item ${index + 1}: Quantity must be positive`);
      if (!item.unit) errors.push(`Item ${index + 1}: Unit is required`);
    });
  }

  // Validate temperature range
  if (data.temperature.max <= data.temperature.min) {
    errors.push('Maximum temperature must be greater than minimum temperature');
  }

  // Validate humidity range
  if (data.humidity.max <= data.humidity.min) {
    errors.push('Maximum humidity must be greater than minimum humidity');
  }

  // Validate dates
  const departure = new Date(data.expectedDeparture);
  const arrival = new Date(data.expectedArrival);
  if (arrival <= departure) {
    errors.push('Expected arrival must be after expected departure');
  }

  // Validate locations are different
  if (data.fromLocationId === data.toLocationId) {
    errors.push('Origin and destination locations must be different');
  }

  return errors;
};
