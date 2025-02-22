import { Asset } from '../../../types/shared';

export interface Equipment extends Asset {
  assignedDate: string;
  assignedBy: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  maintenanceHistory: {
    date: string;
    type: string;
    description: string;
    performedBy: string;
  }[];
  verificationHistory: {
    date: string;
    verifiedBy: string;
    status: 'verified' | 'missing' | 'damaged';
    notes?: string;
  }[];
}

export interface Personnel {
  id: string;
  militaryId: string;
  rank: string;
  firstName: string;
  lastName: string;
  unit: string;
  position: string;
  clearanceLevel: string;
  status: 'active' | 'inactive' | 'deployed';
  equipment: Equipment[];
  contact: {
    email: string;
    phone?: string;
  };
  assignedLocation?: string;
  notes?: string;
  lastVerified?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  type: 'company' | 'battalion' | 'brigade';
  parentUnit?: string;
  commander: string;
  location: string;
  personnel: string[]; // Array of Personnel IDs
  equipment: string[]; // Array of Equipment IDs
}

export interface HandReceipt {
  id: string;
  issuedTo: string; // Personnel ID
  issuedBy: string; // Personnel ID
  items: string[]; // Array of Equipment IDs
  dateIssued: string;
  dateReturned?: string;
  status: 'active' | 'closed' | 'pending';
  signatures: {
    issuer: string;
    receiver: string;
    dateIssued: string;
    dateReturned?: string;
  };
}

export interface PropertyTransfer {
  id: string;
  fromUnit: string;
  toUnit: string;
  items: string[]; // Array of Equipment IDs
  initiatedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  dateInitiated: string;
  dateCompleted?: string;
  notes?: string;
}
