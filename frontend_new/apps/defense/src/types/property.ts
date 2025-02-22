export type PropertyStatus = 'FMC' | 'PMC' | 'NMC';

export interface PropertyItem {
  id: string;
  nsn: string;
  nomenclature: string;
  serialNumber: string;
  status: PropertyStatus;
  imageUrl?: string;
  lastInspection: string;
  nextInspectionDue: string;
  custodyStartDate: string;
  blockchainTxId: string;
  lin: string; // Line Item Number
}

export interface CustodyEvent {
  id: string;
  timestamp: string;
  itemId: string;
  fromUser: {
    id: string;
    rank: string;
    name: string;
  };
  toUser: {
    id: string;
    rank: string;
    name: string;
  };
  blockchainTxId: string;
  location?: string;
  type: 'TRANSFER' | 'INSPECTION' | 'MAINTENANCE' | 'DAMAGE_REPORT';
}

export interface MaintenanceLog {
  id: string;
  itemId: string;
  date: string;
  type: string;
  technician: {
    id: string;
    name: string;
    certificationNumber?: string;
  };
  description: string;
  partsReplaced?: string[];
  blockchainTxId: string;
}

export interface InspectionChecklist {
  id: string;
  itemId: string;
  date: string;
  type: string; // e.g., 'DA 2404'
  inspector: {
    id: string;
    rank: string;
    name: string;
  };
  status: 'PASS' | 'FAIL' | 'CONDITIONAL';
  findings: string[];
  blockchainTxId: string;
}

export interface Attachment {
  id: string;
  itemId: string;
  type: 'PHOTO' | 'DOCUMENT' | 'TM_REFERENCE' | 'DA_FORM';
  name: string;
  url: string;
  uploadDate: string;
  uploadedBy: {
    id: string;
    rank: string;
    name: string;
  };
}

export interface PropertySummary {
  totalItems: number;
  serviceableItems: number;
  upcomingInspections: {
    next7Days: number;
    next30Days: number;
  };
  disputedItems: number;
}

export interface ComplianceStatus {
  itemsInspected: {
    total: number;
    completed: number;
  };
  trainingCertifications: {
    total: number;
    completed: number;
  };
  missingDocuments: MissingDocument[];
};

export interface MissingDocument {
  itemId: string;
  documentType: string;
  dueDate: string;
}

// State interfaces
export interface PropertyState {
  summary: PropertySummary;
  equipmentList: PropertyItem[];
  selectedItemId: string | null;
  selectedItemDetails: {
    item: PropertyItem | null;
    custodyHistory: CustodyEvent[];
    maintenanceLogs: MaintenanceLog[];
    inspectionChecklists: InspectionChecklist[];
    attachments: Attachment[];
  };
  complianceStatus: ComplianceStatus;
  loading: {
    summary: boolean;
    equipmentList: boolean;
    itemDetails: boolean;
    compliance: boolean;
  };
  error: {
    summary?: string;
    equipmentList?: string;
    itemDetails?: string;
    compliance?: string;
  };
  view: 'card' | 'table';
}
