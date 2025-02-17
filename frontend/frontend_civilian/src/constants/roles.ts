import { UserRole } from '../types/users';

export const USER_ROLES: Record<UserRole, string> = {
  ADMIN: 'Admin',
  VIEWER: 'Viewer',
  INVENTORY_MANAGER: 'Inventory Manager',
  INVENTORY_CLERK: 'Inventory Clerk',
  SHIPPING_MANAGER: 'Shipping Manager',
  DRIVER: 'Driver',
  FINANCE_MANAGER: 'Finance Manager',
  AUDITOR: 'Auditor',
  CUSTOM: 'Custom Role'
};

// Roles that require blockchain credentials
export const BLOCKCHAIN_ENABLED_ROLES: UserRole[] = [
  'ADMIN',
  'INVENTORY_MANAGER',
  'SHIPPING_MANAGER',
  'DRIVER' // For confirming deliveries on the blockchain
];

// Define all possible permissions
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Products/Inventory
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  VIEW_INVENTORY: 'view_inventory',
  ADJUST_INVENTORY: 'adjust_inventory',
  
  // Shipments
  VIEW_SHIPMENTS: 'view_shipments',
  CREATE_SHIPMENT: 'create_shipment',
  UPDATE_SHIPMENT: 'update_shipment',
  
  // Blockchain
  VIEW_BLOCKCHAIN: 'view_blockchain',
  INITIATE_BLOCKCHAIN: 'initiate_blockchain',
  
  // User Management
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  VIEW_FINANCIAL: 'view_financial'
} as const;

// Define default permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: Object.values(PERMISSIONS),
  
  VIEWER: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.VIEW_BLOCKCHAIN
  ],
  
  INVENTORY_MANAGER: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.ADJUST_INVENTORY,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.VIEW_BLOCKCHAIN,
    PERMISSIONS.INITIATE_BLOCKCHAIN,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  INVENTORY_CLERK: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.ADJUST_INVENTORY,
    PERMISSIONS.VIEW_BLOCKCHAIN
  ],
  
  SHIPPING_MANAGER: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.CREATE_SHIPMENT,
    PERMISSIONS.UPDATE_SHIPMENT,
    PERMISSIONS.VIEW_BLOCKCHAIN,
    PERMISSIONS.INITIATE_BLOCKCHAIN,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  DRIVER: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.UPDATE_SHIPMENT,
    PERMISSIONS.VIEW_BLOCKCHAIN,
    PERMISSIONS.INITIATE_BLOCKCHAIN
  ],
  
  FINANCE_MANAGER: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.VIEW_BLOCKCHAIN,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_FINANCIAL
  ],
  
  AUDITOR: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.VIEW_BLOCKCHAIN,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_FINANCIAL
  ],
  
  CUSTOM: [] // Empty by default, will be set when creating custom role
};

// Helper function to check if a role requires blockchain credentials
export const requiresBlockchain = (role: UserRole): boolean => {
  return BLOCKCHAIN_ENABLED_ROLES.includes(role);
};

// Helper function to check if a user has a specific permission
export const hasPermission = (userPermissions: string[], permission: string): boolean => {
  return userPermissions.includes(permission);
};

// Helper function to get readable role name
export const getRoleName = (role: UserRole): string => {
  return USER_ROLES[role] || role;
};

// Helper function to get default permissions for a role
export const getDefaultPermissions = (role: UserRole): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};
