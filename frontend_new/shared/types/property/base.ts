export type BasePropertyStatus = 'SERVICEABLE' | 'UNSERVICEABLE' | 'DESTROYED' | 'MISSING' | 'IN_TRANSIT';
export type BaseVerificationStatus = 'VERIFIED' | 'NEEDS_VERIFICATION' | 'OVERDUE' | 'IN_PROGRESS';

export interface BaseProperty {
  id: string;
  name: string;
  description?: string;
  serialNumber: string;
  nsn?: string;
  value: number;
  status: BasePropertyStatus;
  location?: string;
  assignedTo?: string;
  isSensitive: boolean;
  category: string;
  lastVerified?: string;
  nextVerification?: string;
  verificationStatus?: BaseVerificationStatus;
  lastInventoryCheck?: string;
  nextInventoryCheck?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BasePropertyTransfer {
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

export interface BaseSensitiveItem extends BaseProperty {
  isSensitive: true;
  verificationSchedule: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    lastVerification: string;
    nextVerification: string;
    verifiedBy?: string;
  };
  securityLevel: 'SECRET' | 'TOP_SECRET' | 'CONFIDENTIAL';
  handReceipt?: string;
  propertyStatus?: BasePropertyStatus;
  verificationStatus?: BaseVerificationStatus;
  lastInventoryCheck?: string;
  nextInventoryCheck?: string;
}

export interface BaseVerification {
  id: string;
  propertyId: string;
  verifiedBy: string;
  status: BaseVerificationStatus;
  notes?: string;
  location?: string;
  condition?: string;
  timestamp: string;
  nextVerificationDue?: string;
  attachments?: string[];
}

export interface BasePropertyFilters {
  status?: BasePropertyStatus[];
  category?: string[];
  location?: string[];
  assignedTo?: string[];
  verificationStatus?: BaseVerificationStatus[];
  sensitive?: boolean;
  search?: string;
}

export interface BasePropertyStats {
  total: number;
  serviceable: number;
  unserviceable: number;
  sensitive: number;
  value: number;
  needsVerification: number;
  overdue: number;
}
