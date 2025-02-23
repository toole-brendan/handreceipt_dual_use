import React from 'react';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  SwapHoriz as TransferIcon,
  LocationOn as LocationOnIcon,
  LocalShipping as LocalShippingIcon,
  SwapHoriz as SwapHorizIcon,
  Help as HelpIcon,
  Build as BuildIcon,
  ReportProblem as ReportProblemIcon,
  History as HistoryIcon,
  VerifiedUser as VerifiedUserIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  AccountTree as AccountTreeIcon,
  MenuBook as MenuBookIcon,
  HeadsetMic as HeadsetMicIcon,
  School as SchoolIcon,
  AccountCircle as AccountCircleIcon,
  Tune as TuneIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  ShoppingCart as OrdersIcon,
  Payment as PaymentsIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';

import { NavItemConfig } from '@shared/types/navigation/base';

// Main navigation items
export const CIVILIAN_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/civilian/dashboard',
    text: 'Dashboard',
    icon: <DashboardIcon />
  },
  {
    to: '/civilian/inventory',
    text: 'Inventory',
    icon: <InventoryIcon />
  },
  {
    to: '/civilian/orders',
    text: 'Orders',
    icon: <OrdersIcon />
  },
  {
    to: '/civilian/shipments',
    text: 'Shipments',
    icon: <LocalShippingIcon />
  },
  {
    to: '/civilian/wallet',
    text: 'Payments',
    icon: <PaymentsIcon />
  },
  {
    to: '/civilian/qr',
    text: 'QR Management',
    icon: <QrCodeIcon />
  },
  {
    to: '/civilian/reports',
    text: 'Reports',
    icon: <AssessmentIcon />
  },
  {
    to: '/civilian/settings',
    text: 'Settings',
    icon: <SettingsIcon />
  }
];

// Defense navigation items
export const DEFENSE_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/defense/dashboard',
    text: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    to: '/defense/property',
    text: 'Property',
    icon: <InventoryIcon />,
  },
  {
    to: '/defense/unit-inventory',
    text: 'Unit Inventory',
    icon: <InventoryIcon />,
  },
  {
    to: '/defense/transfers',
    text: 'Transfers',
    icon: <SwapHorizIcon />,
  },
  {
    to: '/defense/maintenance',
    text: 'Maintenance',
    icon: <BuildIcon />,
  },
  {
    to: '/defense/qr',
    text: 'QR Management',
    icon: <QrCodeIcon />,
  },
  {
    to: '/defense/reports',
    text: 'Reports',
    icon: <AssessmentIcon />,
  },
  {
    to: '/defense/users',
    text: 'Users',
    icon: <PeopleIcon />,
  },
  {
    to: '/defense/settings',
    text: 'Settings',
    icon: <SettingsIcon />,
  }
];

// Main navigation items (default to defense navigation)
export const MAIN_NAV_ITEMS: NavItemConfig[] = DEFENSE_NAV_ITEMS;
