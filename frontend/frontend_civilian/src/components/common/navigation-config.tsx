import React from 'react';
import {
  Home,
  Package,
  Truck,
  MapPin,
  History,
  FileText,
  Settings,
  AlertTriangle,
  BarChart,
  Users,
  Shield,
  HelpCircle,
  Plus,
  Building2,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export interface NavItemConfig {
  text: string;
  to: string;
  icon: React.ReactNode;
  description?: string;
  subItems?: NavItemConfig[];
}

export const HELP_NAV_ITEMS: NavItemConfig[] = [
  {
    text: 'Documentation',
    to: ROUTES.HELP.DOCUMENTATION,
    icon: <FileText size={20} />,
    description: 'View system documentation and guides'
  },
  {
    text: 'Support',
    to: ROUTES.HELP.SUPPORT,
    icon: <HelpCircle size={20} />,
    description: 'Get help and contact support'
  }
];

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  {
    text: 'Dashboard',
    to: ROUTES.HOME,
    icon: <Home size={20} />,
    description: 'View system overview and key metrics'
  },
  {
    text: 'Products',
    to: ROUTES.PRODUCTS.ROOT,
    icon: <Package size={20} />,
    description: 'Manage products and inventory',
    subItems: [
      {
        text: 'Product Catalog',
        to: ROUTES.PRODUCTS.CATALOG,
        icon: <Package size={20} />,
        description: 'View and manage products'
      },
      {
        text: 'Add Product',
        to: ROUTES.PRODUCTS.ADD,
        icon: <Plus size={20} />,
        description: 'Add a new product'
      }
    ]
  },
  {
    text: 'Shipments',
    to: ROUTES.SHIPMENTS.ROOT,
    icon: <Truck size={20} />,
    description: 'Track and manage shipments',
    subItems: [
      {
        text: 'Track Shipments',
        to: ROUTES.SHIPMENTS.TRACK,
        icon: <History size={20} />,
        description: 'Track active shipments'
      },
      {
        text: 'Create Shipment',
        to: ROUTES.SHIPMENTS.CREATE,
        icon: <Truck size={20} />,
        description: 'Create a new shipment'
      }
    ]
  },
  {
    text: 'Inventory',
    to: ROUTES.INVENTORY.ROOT,
    icon: <MapPin size={20} />,
    description: 'Manage inventory levels and locations',
    subItems: [
      {
        text: 'Overview',
        to: ROUTES.INVENTORY.OVERVIEW,
        icon: <BarChart size={20} />,
        description: 'View inventory overview'
      },
      {
        text: 'Locations',
        to: ROUTES.INVENTORY.LOCATIONS.ROOT,
        icon: <MapPin size={20} />,
        description: 'Manage inventory locations',
        subItems: [
          {
            text: 'All Locations',
            to: ROUTES.INVENTORY.LOCATIONS.ROOT,
            icon: <MapPin size={20} />,
            description: 'View and manage locations'
          },
          {
            text: 'Add Location',
            to: ROUTES.INVENTORY.LOCATIONS.ADD,
            icon: <Plus size={20} />,
            description: 'Add a new location'
          }
        ]
      }
    ]
  },
  {
    text: 'Transactions',
    to: ROUTES.TRANSACTIONS,
    icon: <History size={20} />,
    description: 'View blockchain transactions'
  },
  {
    text: 'Reports',
    to: ROUTES.REPORTS.ROOT,
    icon: <FileText size={20} />,
    description: 'View system reports',
    subItems: [
      {
        text: 'Inventory',
        to: ROUTES.REPORTS.INVENTORY,
        icon: <Package size={20} />,
        description: 'View inventory reports'
      },
      {
        text: 'Shipments',
        to: ROUTES.REPORTS.SHIPMENTS,
        icon: <Truck size={20} />,
        description: 'View shipment reports'
      },
      {
        text: 'Provenance',
        to: ROUTES.REPORTS.PROVENANCE,
        icon: <History size={20} />,
        description: 'View provenance tracking reports'
      },
      {
        text: 'Compliance',
        to: ROUTES.REPORTS.COMPLIANCE,
        icon: <Shield size={20} />,
        description: 'View compliance reports'
      }
    ]
  },
  {
    text: 'Admin',
    to: ROUTES.ADMIN.ROOT,
    icon: <Shield size={20} />,
    description: 'Administrative tools',
    subItems: [
      {
        text: 'Users',
        to: ROUTES.ADMIN.USERS,
        icon: <Users size={20} />,
        description: 'Manage system users'
      }
    ]
  },
];
