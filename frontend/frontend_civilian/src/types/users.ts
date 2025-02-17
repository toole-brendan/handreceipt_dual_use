export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export type UserRole = 
  | 'ADMIN'
  | 'VIEWER'
  | 'INVENTORY_MANAGER'
  | 'INVENTORY_CLERK'
  | 'SHIPPING_MANAGER'
  | 'DRIVER'
  | 'FINANCE_MANAGER'
  | 'AUDITOR'
  | 'CUSTOM';

export interface BlockchainCredentials {
  publicKey: string;
  lastTransaction?: string;
  transactionCount?: number;
}

export interface UserNotificationPreferences {
  email: boolean;
  push: boolean;
  transferRequests: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
  assetChanges: boolean;
}

export interface CivilianUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  company: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  blockchainCredentials?: BlockchainCredentials;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    notifications: UserNotificationPreferences;
  };
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  company?: string;
  department?: string;
  sortBy?: keyof CivilianUser;
  sortDirection?: 'asc' | 'desc';
}

export type FilterValue = string | UserRole | UserStatus | null;

export interface UserUpdateData extends Partial<Omit<CivilianUser, 'id' | 'createdAt' | 'updatedAt'>> {
  id: string;
}

export interface UserCreateData extends Omit<CivilianUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'> {
  password: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  byRole: Record<UserRole, number>;
  byDepartment: Record<string, number>;
}
