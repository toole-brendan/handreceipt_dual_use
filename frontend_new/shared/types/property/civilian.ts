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

export interface CivilianProperty extends BaseProperty {
  // Civilian-specific property fields
  organizationId: string;
  departmentId?: string;
  manufacturer?: string;
  model?: string;
  warrantyExpiration?: string;
  maintenanceSchedule?: {
    lastMaintenance: string;
    nextMaintenance: string;
    frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  };
  regulatoryCompliance?: {
    certifications: string[];
    expirations: Record<string, string>;
    lastAudit?: string;
    nextAudit?: string;
  };
}

export interface CivilianPropertyTransfer extends BasePropertyTransfer {
  organizationId: string;
  departmentId?: string;
  transferType: 'INTERNAL' | 'EXTERNAL';
  approverRole: 'MANAGER' | 'ADMIN';
}

export interface CivilianSensitiveItem extends BaseSensitiveItem {
  organizationId: string;
  departmentId?: string;
  regulatoryCompliance: {
    certifications: string[];
    expirations: Record<string, string>;
    lastAudit: string;
    nextAudit: string;
  };
}

export interface CivilianVerification extends BaseVerification {
  organizationId: string;
  departmentId?: string;
  verifierRole: 'MANAGER' | 'ADMIN' | 'AUDITOR';
  complianceChecklist?: Record<string, boolean>;
}

export interface CivilianPropertyFilters extends BasePropertyFilters {
  organizationId?: string[];
  departmentId?: string[];
  manufacturer?: string[];
  model?: string[];
  complianceStatus?: ('COMPLIANT' | 'NON_COMPLIANT' | 'PENDING')[];
}

export interface CivilianPropertyStats extends BasePropertyStats {
  byOrganization: Record<string, number>;
  byDepartment: Record<string, number>;
  complianceStatus: {
    compliant: number;
    nonCompliant: number;
    pending: number;
  };
  maintenanceStatus: {
    upToDate: number;
    upcoming: number;
    overdue: number;
  };
}
