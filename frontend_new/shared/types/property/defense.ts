import {
  BaseProperty,
  BasePropertyStatus,
  BaseVerificationStatus,
  BasePropertyTransfer,
  BaseSensitiveItem,
  BaseVerification,
  BasePropertyFilters,
  BasePropertyStats,
} from './base';

export interface DefenseProperty extends BaseProperty {
  // Defense-specific property fields
  branchId: string;
  unitId: string;
  stationId?: string;
  dodNumber?: string;
  securityClassification: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  accountabilityType: 'INDIVIDUAL' | 'ORGANIZATIONAL' | 'DURABLE' | 'EXPENDABLE';
  missionEssential: boolean;
  combatEssential?: boolean;
  recoverable: boolean;
  demilitarizationCode?: string;
  technicalOrder?: string;
  militarySpecification?: string;
}

export interface DefensePropertyTransfer extends BasePropertyTransfer {
  branchId: string;
  unitId: string;
  stationId?: string;
  transferType: 'INTRA_UNIT' | 'INTER_UNIT' | 'INTER_BRANCH';
  approverRank: string;
  securityClearance: 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
}

export interface DefenseSensitiveItem extends BaseSensitiveItem {
  branchId: string;
  unitId: string;
  stationId?: string;
  securityClassification: 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  controlledInventoryItemCode: string;
  serializedItemTracking: boolean;
  uniqueItemIdentifier?: string;
  demilitarizationRequired: boolean;
}

export interface DefenseVerification extends BaseVerification {
  branchId: string;
  unitId: string;
  stationId?: string;
  verifierRank: string;
  securityClearance: 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  inspectionType: 'CYCLIC' | 'SENSITIVE_ITEM' | 'CHANGE_OF_CUSTODY';
  commandDirected: boolean;
}

export interface DefensePropertyFilters extends BasePropertyFilters {
  branchId?: string[];
  unitId?: string[];
  stationId?: string[];
  securityClassification?: DefenseProperty['securityClassification'][];
  accountabilityType?: DefenseProperty['accountabilityType'][];
  missionEssential?: boolean;
  combatEssential?: boolean;
}

export interface DefensePropertyStats extends BasePropertyStats {
  byBranch: Record<string, number>;
  byUnit: Record<string, number>;
  byStation: Record<string, number>;
  bySecurityClassification: Record<DefenseProperty['securityClassification'], number>;
  byAccountabilityType: Record<DefenseProperty['accountabilityType'], number>;
  missionEssential: number;
  combatEssential: number;
}
