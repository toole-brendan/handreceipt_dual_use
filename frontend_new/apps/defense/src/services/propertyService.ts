import type {
  PropertySummary,
  PropertyItem,
  CustodyEvent,
  MaintenanceLog,
  InspectionChecklist,
  Attachment,
  ComplianceStatus,
} from '../types/property';

// Mock data
const mockPropertyItems: PropertyItem[] = [
  {
    id: '1',
    nsn: '1005-01-723-9126',
    nomenclature: 'M4A1 Carbine',
    serialNumber: 'W123456',
    status: 'FMC',
    imageUrl: '/assets/images/placeholder.jpg',
    lastInspection: '2024-02-15',
    nextInspectionDue: '2024-03-15',
    custodyStartDate: '2023-12-01',
    blockchainTxId: '0x1234...abcd',
    lin: 'R12345',
  },
  {
    id: '2',
    nsn: '5855-01-642-6771',
    nomenclature: 'AN/PVS-14 Night Vision Device',
    serialNumber: 'N789012',
    status: 'PMC',
    imageUrl: '/assets/images/placeholder.jpg',
    lastInspection: '2024-01-20',
    nextInspectionDue: '2024-02-20',
    custodyStartDate: '2023-11-15',
    blockchainTxId: '0x5678...efgh',
    lin: 'N67890',
  },
];

const mockSummary: PropertySummary = {
  totalItems: 25,
  serviceableItems: 24,
  upcomingInspections: {
    next7Days: 2,
    next30Days: 5,
  },
  disputedItems: 1,
};

const mockComplianceStatus: ComplianceStatus = {
  itemsInspected: {
    total: 25,
    completed: 23,
  },
  trainingCertifications: {
    total: 5,
    completed: 4,
  },
  missingDocuments: [
    {
      itemId: '3',
      documentType: 'DA 5513',
      dueDate: '2024-02-25',
    },
  ],
};

const mockCustodyHistory: CustodyEvent[] = [
  {
    id: '1',
    timestamp: '2023-12-01T14:30:00Z',
    itemId: '1',
    fromUser: {
      id: 'SGT123',
      rank: 'SGT',
      name: 'Smith',
    },
    toUser: {
      id: 'SPC456',
      rank: 'SPC',
      name: 'Johnson',
    },
    blockchainTxId: '0x1234...abcd',
    location: 'FOB Alpha',
    type: 'TRANSFER',
  },
];

const mockMaintenanceLogs: MaintenanceLog[] = [
  {
    id: '1',
    itemId: '1',
    date: '2024-01-15',
    type: 'Preventive Maintenance',
    technician: {
      id: 'TECH1',
      name: 'Williams',
      certificationNumber: 'C123456',
    },
    description: 'Regular cleaning and lubrication',
    partsReplaced: ['Firing pin spring'],
    blockchainTxId: '0x9012...ijkl',
  },
];

const mockInspectionChecklists: InspectionChecklist[] = [
  {
    id: '1',
    itemId: '1',
    date: '2024-02-15',
    type: 'DA 2404',
    inspector: {
      id: 'SGT789',
      rank: 'SGT',
      name: 'Davis',
    },
    status: 'PASS',
    findings: ['All functions normal', 'No visible damage'],
    blockchainTxId: '0x3456...mnop',
  },
];

const mockAttachments: Attachment[] = [
  {
    id: '1',
    itemId: '1',
    type: 'DA_FORM',
    name: 'DA 2062 - Hand Receipt',
    url: '/documents/da2062_123.pdf',
    uploadDate: '2023-12-01',
    uploadedBy: {
      id: 'SGT123',
      rank: 'SGT',
      name: 'Smith',
    },
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Service methods
export const propertyService = {
  // Fetch summary data
  fetchSummary: async (): Promise<PropertySummary> => {
    await delay(500);
    return mockSummary;
  },

  // Fetch equipment list
  fetchEquipmentList: async (): Promise<PropertyItem[]> => {
    await delay(800);
    return mockPropertyItems;
  },

  // Fetch item details
  fetchItemDetails: async (itemId: string): Promise<{
    item: PropertyItem;
    custodyHistory: CustodyEvent[];
    maintenanceLogs: MaintenanceLog[];
    inspectionChecklists: InspectionChecklist[];
    attachments: Attachment[];
  }> => {
    await delay(1000);
    const item = mockPropertyItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item not found');
    }
    return {
      item,
      custodyHistory: mockCustodyHistory.filter(ch => ch.itemId === itemId),
      maintenanceLogs: mockMaintenanceLogs.filter(ml => ml.itemId === itemId),
      inspectionChecklists: mockInspectionChecklists.filter(ic => ic.itemId === itemId),
      attachments: mockAttachments.filter(a => a.itemId === itemId),
    };
  },

  // Fetch compliance status
  fetchComplianceStatus: async (): Promise<ComplianceStatus> => {
    await delay(600);
    return mockComplianceStatus;
  },

  // Add custody event
  addCustodyEvent: async (event: Omit<CustodyEvent, 'id'>): Promise<CustodyEvent> => {
    await delay(1000);
    return {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    };
  },

  // Add maintenance log
  addMaintenanceLog: async (log: Omit<MaintenanceLog, 'id'>): Promise<MaintenanceLog> => {
    await delay(1000);
    return {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
    };
  },

  // Add inspection checklist
  addInspectionChecklist: async (checklist: Omit<InspectionChecklist, 'id'>): Promise<InspectionChecklist> => {
    await delay(1000);
    return {
      ...checklist,
      id: Math.random().toString(36).substr(2, 9),
    };
  },

  // Add attachment
  addAttachment: async (attachment: Omit<Attachment, 'id'>): Promise<Attachment> => {
    await delay(1000);
    return {
      ...attachment,
      id: Math.random().toString(36).substr(2, 9),
    };
  },
};
