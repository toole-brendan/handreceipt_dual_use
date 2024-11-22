// frontend/src/types/property.ts
export interface Property {
  id: string;
  name: string;
  serialNumber: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'maintenance';
  currentHolder: string;
  dateAssigned: string;
}

export interface PropertyTransfer {
  id: string;
  propertyId: string;
  propertyName: string;
  fromPerson: string;
  toPerson: string;
  transferDate: string;
  status: 'completed' | 'pending' | 'rejected';
}