export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PRODUCTS: {
    ROOT: '/products',
    CATALOG: '/products/catalog',
    DETAILS: '/products/details/:id',
    ADD: '/products/add',
  },
  INVENTORY: {
    ROOT: '/inventory',
    OVERVIEW: '/inventory/overview',
    LOCATIONS: {
      ROOT: '/inventory/locations',
      ADD: '/inventory/locations/add',
      EDIT: '/inventory/locations/edit/:id',
      DETAILS: '/inventory/locations/:id',
    },
  },
  SHIPMENTS: {
    ROOT: '/shipments',
    TRACK: '/shipments', // Index route, same as ROOT
    CREATE: '/shipments/create',
    DETAILS: '/shipments/:id',
  },
  TRANSACTIONS: '/transactions',
  REPORTS: {
    ROOT: '/reports',
    INVENTORY: '/reports/inventory',
    SHIPMENTS: '/reports/shipments',
    PROVENANCE: '/reports/provenance',
    COMPLIANCE: '/reports/compliance',
  },
  HELP: {
    ROOT: '/help',
    DOCUMENTATION: '/help/documentation',
    SUPPORT: '/help/support',
  },
  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
  },
  SETTINGS: '/settings',
} as const;
