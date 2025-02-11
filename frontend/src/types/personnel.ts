import { Property } from './property';
import { UserRole } from './auth';

export type PersonnelStatus = 'ACTIVE' | 'INACTIVE' | 'DEPLOYED' | 'LEAVE' | 'TRANSFERRED';
export type DutyStatus = 'ON_DUTY' | 'OFF_DUTY' | 'LEAVE' | 'TDY' | 'TRAINING';
export type UnitType = 'COMPANY' | 'BATTALION' | 'BRIGADE' | 'DIVISION' | 'company' | 'platoon' | 'squad' | 'hq';
export type UnitEchelon = 'TEAM' | 'SQUAD' | 'PLT' | 'CO' | 'BN' | 'BDE' | 'CO-HQ' | 'SQD';

export interface Personnel {
  id: string;
  firstName: string;
  lastName: string;
  rank: string;
  dodId: string;
  unit: Unit;
  unitId?: string;
  platoon?: string;
  position?: string;
  email: string;
  phone?: string;
  status: PersonnelStatus;
  dutyStatus: DutyStatus;
  assignedProperty: Property[];
  clearance: string;
  isCommander?: boolean;
  isPrimaryHandReceipt?: boolean;
  propertyAccess?: {
    canSignFor: boolean;
    canTransfer: boolean;
    canInventory: boolean;
    sensitiveItems: boolean;
  };
  propertyStats?: {
    propertyCount: number;
    sensitiveItemCount: number;
    totalValue: number;
    pendingTransfers: number;
  };
  inventoryStatus?: {
    lastInventory: string;
    nextInventoryDue: string;
    overdueCount: number;
    cycleComplete: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  shortName: string;
  type: UnitType;
  echelon: UnitEchelon;
  parentUnitId?: string;
  commander?: Personnel;
  personnel: Personnel[];
  property: Property[];
  subUnits?: Unit[];
  lastInventory?: string;
  nextInventoryDue?: string;
  lastInventoryCheck?: string;
  nextInventoryCheck?: string;
  stats?: {
    personnelCount: number;
    equipmentCount: number;
    sensitiveItemCount: number;
    pendingTransfers: number;
    overdueInventories: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HandReceipt {
  id: string;
  number: string;
  issuedTo: Personnel;
  issuedBy: Personnel;
  unit: Unit;
  items: Property[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  issueDate: string;
  expirationDate?: string;
  lastVerified?: string;
  nextVerificationDue?: string;
  notes?: string;
  signatures: {
    issuer: string;
    receiver: string;
    witness?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PersonnelFilters {
  status?: PersonnelStatus[];
  dutyStatus?: DutyStatus[];
  unit?: string[];
  platoon?: string[];
  role?: UserRole[];
  search?: string;
}

export interface PersonnelStats {
  total: number;
  active: number;
  deployed: number;
  onLeave: number;
  transferred: number;
}
