// Export specific types from each module
export type {
  BaseUser,
  UserPreferences,
  UserNotificationPreferences,
  BaseAuthState,
  BaseAuthResponse,
  BaseAuthError,
} from './auth';

export type {
  HandReceipt,
  PropertyTransfer,
  HandReceiptBase,
  HandReceiptItem,
  HandReceiptSignatures,
  HandReceiptFilters,
  HandReceiptStats,
  HandReceiptVerification,
  HandReceiptTransfer,
} from './handReceipt';

// Export navigation types
export type {
  NavigationItem,
  NavigationConfig,
  NavigationState,
  NavigationContext,
  BreadcrumbItem,
  NavigationGroup,
  NavItemConfig,
} from './navigation';

// Export app-specific types
export type {
  CivilianUser,
  CivilianAuthState,
  CivilianAuthResponse,
} from './auth';

export type {
  DefenseUser,
  DefenseAuthState,
  DefenseAuthResponse,
} from './auth';

export type {
  CivilianNavItem,
  CivilianConfig,
  CivilianSearchScope,
} from './navigation';

export type {
  DefenseNavItem,
  DefenseConfig,
  DefenseSearchScope,
} from './navigation';

// Export other module types
export * from './alerts';
export * from './command';
export * from './common';
export * from './pdf';
export * from './personnel';
export * from './property';
export * from './reports';
export * from './shared';
export * from './system';
export * from './theme';
export * from './user';
export * from './websocket';

// Export search scope constants
export {
  ADMIN_SEARCH_SCOPE,
  MANAGER_SEARCH_SCOPE,
  USER_SEARCH_SCOPE,
  COMMANDER_SEARCH_SCOPE,
  OFFICER_SEARCH_SCOPE,
  NCO_SEARCH_SCOPE,
  SOLDIER_SEARCH_SCOPE,
} from './navigation';
