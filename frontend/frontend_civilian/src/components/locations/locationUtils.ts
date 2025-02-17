import { PharmaceuticalLocation } from '@/mocks/api/pharmaceuticals-locations.mock';
import { LocationFormData } from './LocationForm';

export interface CreateLocationData extends Omit<LocationFormData, 'capacity' | 'temperature' | 'humidity'> {
  capacity: {
    total: number;
    used: number;
    unit: string;
  };
  temperature: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  humidity: {
    min: number;
    max: number;
  };
}

export const validateLocationData = (data: CreateLocationData): string[] => {
  const errors: string[] = [];

  // Basic validation
  if (!data.name?.trim()) errors.push('Name is required');
  if (!data.address?.trim()) errors.push('Address is required');
  if (!data.type) errors.push('Type is required');
  if (!data.status) errors.push('Status is required');
  if (!data.securityLevel) errors.push('Security level is required');

  // Capacity validation
  if (data.capacity.total <= 0) {
    errors.push('Total capacity must be greater than 0');
  }
  if (data.capacity.used < 0) {
    errors.push('Used capacity cannot be negative');
  }
  if (data.capacity.used > data.capacity.total) {
    errors.push('Used capacity cannot exceed total capacity');
  }
  if (!data.capacity.unit?.trim()) {
    errors.push('Capacity unit is required');
  }

  // Temperature validation
  if (typeof data.temperature.min !== 'number') {
    errors.push('Minimum temperature must be a number');
  }
  if (typeof data.temperature.max !== 'number') {
    errors.push('Maximum temperature must be a number');
  }
  if (data.temperature.max <= data.temperature.min) {
    errors.push('Maximum temperature must be greater than minimum temperature');
  }

  // Humidity validation
  if (typeof data.humidity.min !== 'number') {
    errors.push('Minimum humidity must be a number');
  }
  if (typeof data.humidity.max !== 'number') {
    errors.push('Maximum humidity must be a number');
  }
  if (data.humidity.min < 0 || data.humidity.min > 100) {
    errors.push('Minimum humidity must be between 0 and 100');
  }
  if (data.humidity.max < 0 || data.humidity.max > 100) {
    errors.push('Maximum humidity must be between 0 and 100');
  }
  if (data.humidity.max <= data.humidity.min) {
    errors.push('Maximum humidity must be greater than minimum humidity');
  }

  return errors;
};

export const createLocation = async (data: CreateLocationData): Promise<PharmaceuticalLocation> => {
  // Validate the data
  const validationErrors = validateLocationData(data);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join('\n'));
  }

  // In a real app, this would make an API call
  // For now, we'll simulate creating a location
  const newLocation: PharmaceuticalLocation = {
    id: `LOC${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    type: data.type,
    address: data.address,
    capacity: data.capacity,
    temperature: {
      ...data.temperature,
      current: (data.temperature.min + data.temperature.max) / 2,
    },
    humidity: {
      ...data.humidity,
      current: (data.humidity.min + data.humidity.max) / 2,
      unit: '%',
    },
    certifications: data.certifications,
    status: data.status,
    securityLevel: data.securityLevel,
    lastInspectionDate: new Date().toISOString(),
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, we would also create a blockchain transaction here
  // to record the location creation
  console.log('Creating blockchain transaction for location creation:', {
    type: 'CREATE_LOCATION',
    locationId: newLocation.id,
    timestamp: new Date().toISOString(),
    data: newLocation,
  });

  return newLocation;
};

export const updateLocation = async (
  id: string,
  data: CreateLocationData
): Promise<PharmaceuticalLocation> => {
  // Validate the data
  const validationErrors = validateLocationData(data);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join('\n'));
  }

  // In a real app, this would make an API call
  // For now, we'll simulate updating a location
  const updatedLocation: PharmaceuticalLocation = {
    id,
    name: data.name,
    type: data.type,
    address: data.address,
    capacity: data.capacity,
    temperature: {
      ...data.temperature,
      current: (data.temperature.min + data.temperature.max) / 2,
    },
    humidity: {
      ...data.humidity,
      current: (data.humidity.min + data.humidity.max) / 2,
      unit: '%',
    },
    certifications: data.certifications,
    status: data.status,
    securityLevel: data.securityLevel,
    lastInspectionDate: new Date().toISOString(),
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, we would also create a blockchain transaction here
  // to record the location update
  console.log('Creating blockchain transaction for location update:', {
    type: 'UPDATE_LOCATION',
    locationId: id,
    timestamp: new Date().toISOString(),
    data: updatedLocation,
  });

  return updatedLocation;
};

export const getLocationCapacityStatus = (
  used: number,
  total: number
): 'low' | 'medium' | 'high' => {
  const percentage = (used / total) * 100;
  if (percentage < 50) return 'low';
  if (percentage < 80) return 'medium';
  return 'high';
};

export const getLocationEnvironmentalStatus = (
  location: PharmaceuticalLocation
): 'normal' | 'warning' | 'critical' => {
  const tempInRange =
    location.temperature.current >= location.temperature.min &&
    location.temperature.current <= location.temperature.max;

  const humidityInRange =
    location.humidity.current >= location.humidity.min &&
    location.humidity.current <= location.humidity.max;

  if (!tempInRange && !humidityInRange) return 'critical';
  if (!tempInRange || !humidityInRange) return 'warning';
  return 'normal';
};
