/**
 * User types shared between civilian and defense apps
 */

/**
 * Common user status
 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

/**
 * Common blockchain credentials
 */
export interface BlockchainCredentials {
  /** User's public key */
  publicKey: string;
  /** Last transaction hash */
  lastTransaction?: string;
  /** Total number of transactions */
  transactionCount?: number;
}

/**
 * Common notification preferences
 */
export interface UserNotificationPreferences {
  /** Enable email notifications */
  email: boolean;
  /** Enable push notifications */
  push: boolean;
  /** Enable transfer request notifications */
  transferRequests: boolean;
  /** Enable security alert notifications */
  securityAlerts: boolean;
  /** Enable system update notifications */
  systemUpdates: boolean;
  /** Enable asset change notifications */
  assetChanges: boolean;
}

/**
 * Common user preferences
 */
export interface UserPreferences {
  /** UI theme preference */
  theme: 'light' | 'dark' | 'system';
  /** Language preference */
  language: string;
  /** Timezone preference */
  timezone: string;
  /** Date format preference */
  dateFormat: string;
  /** Notification preferences */
  notifications: UserNotificationPreferences;
}

/**
 * Base user interface
 */
export interface BaseUser {
  /** User ID */
  id: string;
  /** Username */
  username: string;
  /** Email address */
  email: string;
  /** Role */
  role: string;
  /** Account status */
  status: UserStatus;
  /** Blockchain credentials */
  blockchainCredentials?: BlockchainCredentials;
  /** User permissions */
  permissions: string[];
  /** Last login timestamp */
  lastLogin?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** User preferences */
  preferences: UserPreferences;
}

/**
 * Civilian-specific user role
 */
export type CivilianUserRole = 
  | 'ADMIN'
  | 'VIEWER'
  | 'INVENTORY_MANAGER'
  | 'INVENTORY_CLERK'
  | 'SHIPPING_MANAGER'
  | 'DRIVER'
  | 'FINANCE_MANAGER'
  | 'AUDITOR'
  | 'CUSTOM';

/**
 * Civilian-specific user interface
 */
export interface CivilianUser extends BaseUser {
  /** Full name */
  fullName: string;
  /** Company name */
  company: string;
  /** Department name */
  department: string;
  /** Role (civilian-specific) */
  role: CivilianUserRole;
}

/**
 * Defense-specific user interface
 */
export interface DefenseUser extends BaseUser {
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Phone number */
  phoneNumber: string;
  /** Military rank */
  rank: string;
  /** Unit assignment */
  unit: string;
  /** Service branch */
  branch: string;
  /** Military Occupational Specialty */
  mos: string;
  /** DoD ID number */
  dodId: string;
  /** Security classification */
  classification: string;
  /** Profile image URL */
  profileImage: string;
}

/**
 * User filters interface
 */
export interface UserFilters {
  /** Filter by role */
  role?: string;
  /** Filter by status */
  status?: UserStatus;
  /** Search text */
  search?: string;
  /** Filter by company (civilian) */
  company?: string;
  /** Filter by department (civilian) */
  department?: string;
  /** Filter by unit (defense) */
  unit?: string;
  /** Filter by branch (defense) */
  branch?: string;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * User settings update interface
 */
export interface UserSettingsUpdate {
  /** Updated email */
  email?: string;
  /** Updated phone number */
  phoneNumber?: string;
  /** Updated timezone */
  timezone?: string;
  /** Updated date format */
  dateFormat?: string;
  /** Updated language */
  language?: string;
  /** Updated theme */
  theme?: 'light' | 'dark' | 'system';
  /** Updated notification settings */
  notifications?: Partial<UserNotificationPreferences>;
}

/**
 * User creation data interface
 */
export interface UserCreateData extends Omit<BaseUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'> {
  /** Initial password */
  password: string;
}

/**
 * User update data interface
 */
export interface UserUpdateData extends Partial<Omit<BaseUser, 'id' | 'createdAt' | 'updatedAt'>> {
  /** User ID */
  id: string;
}

/**
 * User statistics interface
 */
export interface UserStats {
  /** Total user count */
  total: number;
  /** Active user count */
  active: number;
  /** Inactive user count */
  inactive: number;
  /** Pending user count */
  pending: number;
  /** User count by role */
  byRole: Record<string, number>;
  /** User count by department/unit */
  byDepartment: Record<string, number>;
}
