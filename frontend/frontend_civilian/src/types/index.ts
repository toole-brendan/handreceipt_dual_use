export * from '@/types/alerts';
export * from '@/types/auth';
export * from '@/types/common';
export * from '@/types/handReceipt';
export * from '@/types/personnel';
export * from '@/types/property';
export * from '@/types/system';
export * from '@/types/user';

// Re-export commonly used types
export type {
  DateRange,
  PaginationState,
  SortState,
  FilterState,
  TableState,
  SelectOption,
  LoadingState,
  AsyncState,
} from '@/types/common';

// Export API types from services/api/types
export type { ApiResponse, ApiError } from '@/services/api/types';

export type {
  UserRole,
  User,
  AuthState,
} from '@/types/auth';

export type {
  Property,
  PropertyStatus,
  VerificationStatus,
  PropertyTransfer,
  SensitiveItem,
  Verification,
  PropertyFilters,
  PropertyStats,
} from '@/types/property';

export type {
  Personnel,
  PersonnelStatus,
  DutyStatus,
  Unit,
  UnitType,
  UnitEchelon,
  HandReceipt,
  PersonnelFilters,
  PersonnelStats,
} from '@/types/personnel';

export type {
  UserProfile,
  UserSettingsUpdate,
  UserPreferences,
} from '@/types/user';

export type {
  Alert,
} from '@/types/alerts';

export type {
  SystemState,
  SystemMetrics,
  SystemNotification,
  SystemNotifications,
  SystemUpdate,
  SystemUpdates,
  SystemConfig,
  SystemStatus,
} from '@/types/system';
