import { Personnel } from './personnel';
import { Property, PropertyTransfer } from './property';

export type { PropertyTransfer };

export interface HandReceiptItem extends Partial<Property> {
  id: string;
  name: string;
  serialNumber: string;
  value: number;
  isSensitive: boolean;
  quantity: number;
  condition: string;
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  model?: string;
  lastInventoried?: string;
  location?: string;
  nsn?: string;
  status?: Property['status'];
  category?: string;
}

export interface HandReceiptSignatures {
  issuer: string;
  receiver: string;
  witness?: string;
}

export interface HandReceiptBase {
  id: string;
  number?: string;
  type: 'TEMPORARY' | 'PERMANENT' | 'COMPONENT' | 'primary';
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'CLOSED' | 'active';
  holder: Personnel;
  primaryHolder: Personnel;
  items: HandReceiptItem[];
  signatures: HandReceiptSignatures;
  issueDate: string;
  lastUpdated: string;
  expirationDate?: string;
  lastVerified?: string;
  nextVerificationDue?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HandReceiptFilters {
  status?: HandReceiptBase['status'][];
  type?: HandReceiptBase['type'][];
  issuedTo?: string[];
  issuedBy?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface HandReceiptStats {
  total: number;
  active: number;
  pending: number;
  expired: number;
  needsVerification: number;
  totalValue: number;
}

export interface HandReceiptVerification {
  id: string;
  handReceiptId: string;
  verifiedBy: Personnel;
  verifiedAt: string;
  status: 'COMPLETE' | 'INCOMPLETE' | 'DISCREPANCY';
  items: {
    itemId: string;
    verified: boolean;
    condition: string;
    notes?: string;
  }[];
  notes?: string;
  attachments?: string[];
}

export interface HandReceiptTransfer {
  id: string;
  handReceiptId: string;
  fromPerson: Personnel;
  toPerson: Personnel;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'pending';
  reason?: string;
  notes?: string;
  approvedBy?: Personnel;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type HandReceipt = HandReceiptBase;
