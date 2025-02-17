import { CivilianUser, UserRole, UserStatus } from '../../types/users';
import { ROLE_PERMISSIONS } from '../../constants/roles';

// Helper to generate a mock blockchain public key
const generateMockPublicKey = () => {
  return `0x${Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)).join('')}`;
};

// Helper to generate timestamps within the last month
const getRecentDate = (daysAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockUsers: CivilianUser[] = [
  {
    id: '1',
    username: 'admin.user',
    email: 'admin@supplychain.com',
    fullName: 'Alex Thompson',
    company: 'SupplyChain Solutions Inc.',
    department: 'Administration',
    role: 'ADMIN',
    status: 'ACTIVE',
    blockchainCredentials: {
      publicKey: generateMockPublicKey(),
      lastTransaction: getRecentDate(1),
      transactionCount: 156
    },
    permissions: ROLE_PERMISSIONS.ADMIN,
    lastLogin: getRecentDate(0),
    createdAt: getRecentDate(90),
    updatedAt: getRecentDate(1),
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: true,
        transferRequests: true,
        securityAlerts: true,
        systemUpdates: true,
        assetChanges: true
      }
    }
  },
  {
    id: '2',
    username: 'inventory.manager',
    email: 'inventory@supplychain.com',
    fullName: 'Sarah Chen',
    company: 'SupplyChain Solutions Inc.',
    department: 'Warehouse',
    role: 'INVENTORY_MANAGER',
    status: 'ACTIVE',
    blockchainCredentials: {
      publicKey: generateMockPublicKey(),
      lastTransaction: getRecentDate(2),
      transactionCount: 89
    },
    permissions: ROLE_PERMISSIONS.INVENTORY_MANAGER,
    lastLogin: getRecentDate(0),
    createdAt: getRecentDate(60),
    updatedAt: getRecentDate(2),
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/Chicago',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: true,
        transferRequests: true,
        securityAlerts: true,
        systemUpdates: false,
        assetChanges: true
      }
    }
  },
  {
    id: '3',
    username: 'shipping.manager',
    email: 'shipping@supplychain.com',
    fullName: 'Michael Rodriguez',
    company: 'SupplyChain Solutions Inc.',
    department: 'Logistics',
    role: 'SHIPPING_MANAGER',
    status: 'ACTIVE',
    blockchainCredentials: {
      publicKey: generateMockPublicKey(),
      lastTransaction: getRecentDate(1),
      transactionCount: 234
    },
    permissions: ROLE_PERMISSIONS.SHIPPING_MANAGER,
    lastLogin: getRecentDate(1),
    createdAt: getRecentDate(75),
    updatedAt: getRecentDate(1),
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: true,
        transferRequests: true,
        securityAlerts: true,
        systemUpdates: true,
        assetChanges: true
      }
    }
  },
  {
    id: '4',
    username: 'driver.1',
    email: 'driver1@supplychain.com',
    fullName: 'James Wilson',
    company: 'SupplyChain Solutions Inc.',
    department: 'Logistics',
    role: 'DRIVER',
    status: 'ACTIVE',
    blockchainCredentials: {
      publicKey: generateMockPublicKey(),
      lastTransaction: getRecentDate(0),
      transactionCount: 45
    },
    permissions: ROLE_PERMISSIONS.DRIVER,
    lastLogin: getRecentDate(0),
    createdAt: getRecentDate(45),
    updatedAt: getRecentDate(0),
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/Chicago',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: true,
        transferRequests: true,
        securityAlerts: false,
        systemUpdates: false,
        assetChanges: true
      }
    }
  },
  {
    id: '5',
    username: 'finance.manager',
    email: 'finance@supplychain.com',
    fullName: 'Emma Davis',
    company: 'SupplyChain Solutions Inc.',
    department: 'Finance',
    role: 'FINANCE_MANAGER',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSIONS.FINANCE_MANAGER,
    lastLogin: getRecentDate(2),
    createdAt: getRecentDate(120),
    updatedAt: getRecentDate(2),
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: false,
        transferRequests: false,
        securityAlerts: true,
        systemUpdates: true,
        assetChanges: false
      }
    }
  },
  {
    id: '6',
    username: 'auditor.external',
    email: 'auditor@auditfirm.com',
    fullName: 'David Kim',
    company: 'External Audit Firm LLC',
    department: 'Compliance',
    role: 'AUDITOR',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSIONS.AUDITOR,
    lastLogin: getRecentDate(5),
    createdAt: getRecentDate(30),
    updatedAt: getRecentDate(5),
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: false,
        transferRequests: false,
        securityAlerts: true,
        systemUpdates: false,
        assetChanges: false
      }
    }
  },
  {
    id: '7',
    username: 'inventory.clerk1',
    email: 'clerk1@supplychain.com',
    fullName: 'Lisa Martinez',
    company: 'SupplyChain Solutions Inc.',
    department: 'Warehouse',
    role: 'INVENTORY_CLERK',
    status: 'ACTIVE',
    permissions: ROLE_PERMISSIONS.INVENTORY_CLERK,
    lastLogin: getRecentDate(0),
    createdAt: getRecentDate(15),
    updatedAt: getRecentDate(0),
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'America/Chicago',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: true,
        transferRequests: true,
        securityAlerts: false,
        systemUpdates: false,
        assetChanges: true
      }
    }
  },
  {
    id: '8',
    username: 'new.user',
    email: 'pending@supplychain.com',
    fullName: 'Robert Taylor',
    company: 'SupplyChain Solutions Inc.',
    department: 'Warehouse',
    role: 'INVENTORY_CLERK',
    status: 'PENDING',
    permissions: ROLE_PERMISSIONS.INVENTORY_CLERK,
    createdAt: getRecentDate(1),
    updatedAt: getRecentDate(1),
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: true,
        transferRequests: true,
        securityAlerts: true,
        systemUpdates: true,
        assetChanges: true
      }
    }
  },
  {
    id: '9',
    username: 'inactive.user',
    email: 'inactive@supplychain.com',
    fullName: 'Former Employee',
    company: 'SupplyChain Solutions Inc.',
    department: 'Logistics',
    role: 'DRIVER',
    status: 'INACTIVE',
    blockchainCredentials: {
      publicKey: generateMockPublicKey(),
      lastTransaction: getRecentDate(30),
      transactionCount: 12
    },
    permissions: ROLE_PERMISSIONS.DRIVER,
    lastLogin: getRecentDate(30),
    createdAt: getRecentDate(180),
    updatedAt: getRecentDate(30),
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/Chicago',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: false,
        push: false,
        transferRequests: false,
        securityAlerts: false,
        systemUpdates: false,
        assetChanges: false
      }
    }
  }
];
