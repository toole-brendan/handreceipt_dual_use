/**
 * Defense-specific route constants
 */

export const DEFENSE_ROUTES = {
  // Auth routes
  ROOT: '/',
  LOGIN: '/login',
  LOGOUT: '/logout',

  // Main routes
  DEFENSE: '/defense',
  DASHBOARD: '/defense/dashboard',
  PROPERTY: '/defense/property',
  UNIT_INVENTORY: '/defense/unit-inventory',
  TRANSFERS: '/defense/transfers',
  MAINTENANCE: '/defense/maintenance',
  REPORTS: '/defense/reports',
  USERS: '/defense/users',
  SETTINGS: '/defense/settings',
  HELP: '/defense/help',

  // Nested routes
  PROPERTY_ASSIGNED: '/defense/property/assigned-items',
  PROPERTY_DETAILS: '/defense/property/item-details',
  UNIT_INVENTORY_LIST: '/defense/unit-inventory/list',
  UNIT_INVENTORY_DETAILS: '/defense/unit-inventory/details',
  SETTINGS_PROFILE: '/defense/settings/profile',
  SETTINGS_SECURITY: '/defense/settings/security',
  MAINTENANCE_SCHEDULE: '/defense/maintenance/scheduled-logs',
  MAINTENANCE_REPORT: '/defense/maintenance/report-issue',
  MAINTENANCE_HISTORY: '/defense/maintenance/historical-records',
} as const;

export type DefenseRoute = typeof DEFENSE_ROUTES[keyof typeof DEFENSE_ROUTES];
