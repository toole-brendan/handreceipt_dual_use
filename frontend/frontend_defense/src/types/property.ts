export type PropertyStatus = 'SERVICEABLE' | 'UNSERVICEABLE' | 'DESTROYED' | 'MISSING' | 'IN_TRANSIT';
export type VerificationStatus = 'VERIFIED' | 'NEEDS_VERIFICATION' | 'OVERDUE' | 'IN_PROGRESS';

export interface Property {
  id: string;
  name: string;
  description?: string;
  serialNumber: string;
  nsn?: string;
  value: number;
  status: PropertyStatus;
  location?: string;
  assignedTo?: string;
  isSensitive: boolean;
  category: string;
  lastVerified?: string;
  nextVerification?: string;
  verificationStatus?: VerificationStatus;
  lastInventoryCheck?: string;
  nextInventoryCheck?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyTransfer {
  id: string;
  propertyId: string;
  fromPersonId: string;
  toPersonId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface SensitiveItem extends Property {
  isSensitive: true;
  verificationSchedule: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    lastVerification: string;
    nextVerification: string;
    verifiedBy?: string;
  };
  securityLevel: 'SECRET' | 'TOP_SECRET' | 'CONFIDENTIAL';
  handReceipt?: string;
  propertyStatus?: PropertyStatus;
  verificationStatus?: VerificationStatus;
  lastInventoryCheck?: string;
  nextInventoryCheck?: string;
}

export interface Verification {
  id: string;
  propertyId: string;
  verifiedBy: string;
  status: VerificationStatus;
  notes?: string;
  location?: string;
  condition?: string;
  timestamp: string;
  nextVerificationDue?: string;
  attachments?: string[];
}

export interface PropertyFilters {
  status?: PropertyStatus[];
  category?: string[];
  location?: string[];
  assignedTo?: string[];
  verificationStatus?: VerificationStatus[];
  sensitive?: boolean;
  search?: string;
}

export interface PropertyStats {
  total: number;
  serviceable: number;
  unserviceable: number;
  sensitive: number;
  value: number;
  needsVerification: number;
  overdue: number;
}
