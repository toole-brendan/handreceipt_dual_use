// Common Types
export interface PropertyItem {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  dateSignedFor: string;
  maintenanceStatus: 'Good' | 'Due' | 'Overdue';
  handReceiptUrl: string;
  signedFrom: string;
}

export interface QuickStats {
  totalItems: number;
  itemsNeedingAttention: number;
  nextMaintenance: string;
  nextInventoryCheck: string;
  totalValue: number;
}

export interface MaintenanceRequest {
  id: string;
  itemName: string;
  dateSubmitted: string;
  daysInRepair: number;
  status: 'Submitted' | 'In Progress' | 'Completed' | 'Delayed';
  expectedCompletion: string;
}

// Officer Dashboard Types
export interface PropertyTransfer {
  id: string;
  fromUnit: string;
  toUnit: string;
  items: string[];
  date: string;
  status: 'Pending' | 'Approved' | 'Completed';
  highValue: boolean;
}

export interface InventoryCheck {
  id: string;
  date: string;
  assignedOfficer: string;
  type: 'Cyclic' | 'Sensitive Items';
  location: string;
  time: string;
  lastCheckStatus: 'Completed' | 'Incomplete' | 'Pending';
  reportUrl?: string;
}

export interface OfficerDashboardData {
  personalProperty: {
    items: PropertyItem[];
    quickStats: QuickStats;
  };
  recentTransfers: PropertyTransfer[];
  inventoryCalendar: InventoryCheck[];
}

// NCO Dashboard Types
export interface SpecialPropertyAssignment {
  id: string;
  soldier: {
    name: string;
    rank: string;
  };
  items: PropertyItem[];
  dateAssigned: string;
  qualificationStatus: 'Qualified' | 'Pending' | 'Expired';
  nextTrainingDate: string;
  handReceiptUrl: string;
}

export interface NCODashboardData {
  personalProperty: {
    items: PropertyItem[];
    quickStats: QuickStats;
  };
  maintenance: {
    recentItems: MaintenanceRequest[];
    totalInMaintenance: number;
    pastDueItems: number;
    priorityItems: number;
  };
  specialAssignments: SpecialPropertyAssignment[];
}

// Soldier Dashboard Types
export interface SoldierDashboardData {
  personalProperty: {
    items: PropertyItem[];
    quickStats: QuickStats;
  };
} 