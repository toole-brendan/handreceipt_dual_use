/**
 * Defense-specific route constants
 */

export const DEFENSE_ROUTES = {
  // Auth routes
  LOGIN: '/',
  LOGOUT: '/defense/logout',

  // Dashboard
  DASHBOARD: '/defense/dashboard',

  // Property routes
  MY_PROPERTY: '/defense/my-property',
  MY_PROPERTY_ASSIGNED: '/defense/my-property/assigned-items',
  MY_PROPERTY_DETAILS: '/defense/my-property/item-details',

  // Settings routes
  SETTINGS: '/defense/settings',
  SETTINGS_PROFILE: '/defense/settings/profile',
  SETTINGS_SECURITY: '/defense/settings/security',

  // Utility routes
  UTILITY: '/defense/utility',
  UTILITY_LOGS: '/defense/utility/logs',
  UTILITY_METRICS: '/defense/utility/metrics',

  // Maintenance & Inspections routes
  MAINTENANCE: '/defense/maintenance-inspections',
  MAINTENANCE_SCHEDULE: '/defense/maintenance-inspections/scheduled-logs',
  MAINTENANCE_REPORT: '/defense/maintenance-inspections/report-issue',
  MAINTENANCE_HISTORY: '/defense/maintenance-inspections/historical-records',
} as const;

export type DefenseRoute = typeof DEFENSE_ROUTES[keyof typeof DEFENSE_ROUTES];
