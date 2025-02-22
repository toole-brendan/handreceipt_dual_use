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
} from '@mui/icons-material';

import { NavItemConfig } from '@shared/types/navigation/base';

// Help navigation items
export const HELP_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/help',
    text: 'Help',
    icon: <HelpIcon />,
  },
];

// Civilian navigation items
export const CIVILIAN_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/civilian/dashboard',
    text: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    to: '/civilian/inventory',
    text: 'Inventory',
    icon: <InventoryIcon />,
  },
  {
    to: '/civilian/orders',
    text: 'Orders',
    icon: <LocalShippingIcon />,
  },
  {
    to: '/civilian/supply-chain',
    text: 'Supply Chain Tracking',
    icon: <SwapHorizIcon />,
  },
  {
    to: '/civilian/contracts',
    text: 'Smart Contracts',
    icon: <AssignmentIcon />,
  },
  {
    to: '/civilian/wallet',
    text: 'Payments/Wallet',
    icon: <AccountBalanceWalletIcon />,
  },
  {
    to: '/civilian/reports',
    text: 'Reports',
    icon: <AssessmentIcon />,
  },
  {
    to: '/civilian/users',
    text: 'User Management',
    icon: <PeopleIcon />,
  },
  {
    to: '/civilian/settings',
    text: 'Settings',
    icon: <SettingsIcon />,
  },
  {
    to: '/civilian/support',
    text: 'Help/Support',
    icon: <HelpIcon />,
  },
];

// Defense navigation items
export const DEFENSE_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/defense/dashboard',
    text: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    to: '/defense/my-property',
    text: 'My Property',
    icon: <InventoryIcon />,
    children: [
      {
        to: '/defense/my-property/assigned-items',
        text: 'Assigned Items',
        icon: <InventoryIcon />,
      },
      {
        to: '/defense/my-property/item-details',
        text: 'Item Details',
        icon: <InventoryIcon />,
      },
    ],
  },
  {
    to: '/defense/transfers',
    text: 'Transfers',
    icon: <SwapHorizIcon />,
    children: [
      {
        to: '/defense/transfers/initiate-transfer',
        text: 'Initiate Transfer',
        icon: <SwapHorizIcon />,
      },
      {
        to: '/defense/transfers/pending-actions',
        text: 'Pending Actions',
        icon: <AssignmentIcon />,
      },
      {
        to: '/defense/transfers/transfer-history',
        text: 'Transfer History',
        icon: <SwapHorizIcon />,
      },
    ],
  },
  {
    to: '/defense/inventory-management',
    text: 'Inventory Management',
    icon: <InventoryIcon />,
    children: [
      {
        to: '/defense/inventory-management/global-view',
        text: 'Global View',
        icon: <InventoryIcon />,
      },
      {
        to: '/defense/inventory-management/reconciliation',
        text: 'Reconciliation',
        icon: <AssessmentIcon />,
      },
      {
        to: '/defense/inventory-management/bulk-actions',
        text: 'Bulk Actions',
        icon: <AssignmentIcon />,
      },
    ],
  },
  {
    to: '/defense/maintenance-inspections',
    text: 'Maintenance & Inspections',
    icon: <BuildIcon />,
    children: [
      {
        to: '/defense/maintenance-inspections/scheduled-logs',
        text: 'Scheduled Logs',
        icon: <AssessmentIcon />,
      },
      {
        to: '/defense/maintenance-inspections/report-issue',
        text: 'Report Issue',
        icon: <ReportProblemIcon />,
      },
      {
        to: '/defense/maintenance-inspections/historical-records',
        text: 'Historical Records',
        icon: <HistoryIcon />,
      },
    ],
  },
  {
    to: '/defense/chain-of-custody',
    text: 'Chain of Custody',
    icon: <SecurityIcon />,
    children: [
      {
        to: '/defense/chain-of-custody/audit-trail',
        text: 'Audit Trail',
        icon: <AssignmentIcon />,
      },
      {
        to: '/defense/chain-of-custody/compliance-checks',
        text: 'Compliance Checks',
        icon: <VerifiedUserIcon />,
      },
    ],
  },
  {
    to: '/defense/reports-analytics',
    text: 'Reports & Analytics',
    icon: <AssessmentIcon />,
    children: [
      {
        to: '/defense/reports-analytics/custom-reports',
        text: 'Custom Reports',
        icon: <AssessmentIcon />,
      },
      {
        to: '/defense/reports-analytics/trends',
        text: 'Trends',
        icon: <TimelineIcon />,
      },
    ],
  },
  {
    to: '/defense/alerts-tasks',
    text: 'Alerts & Tasks',
    icon: <NotificationsIcon />,
    children: [
      {
        to: '/defense/alerts-tasks/priority-notifications',
        text: 'Priority Notifications',
        icon: <NotificationsIcon />,
      },
      {
        to: '/defense/alerts-tasks/action-items',
        text: 'Action Items',
        icon: <AssignmentIcon />,
      },
    ],
  },
  {
    to: '/defense/user-management',
    text: 'User Management',
    icon: <PeopleIcon />,
    children: [
      {
        to: '/defense/user-management/roles-permissions',
        text: 'Roles & Permissions',
        icon: <PeopleIcon />,
      },
      {
        to: '/defense/user-management/unit-hierarchy',
        text: 'Unit Hierarchy',
        icon: <AccountTreeIcon />,
      },
    ],
  },
  {
    to: '/defense/support',
    text: 'Support',
    icon: <HelpIcon />,
    children: [
      {
        to: '/defense/support/field-manuals',
        text: 'Field Manuals',
        icon: <MenuBookIcon />,
      },
      {
        to: '/defense/support/help-desk',
        text: 'Help Desk',
        icon: <HeadsetMicIcon />,
      },
      {
        to: '/defense/support/training',
        text: 'Training',
        icon: <SchoolIcon />,
      },
    ],
  },
  {
    to: '/defense/settings',
    text: 'Settings',
    icon: <SettingsIcon />,
    children: [
      {
        to: '/defense/settings/account',
        text: 'Account',
        icon: <AccountCircleIcon />,
      },
      {
        to: '/defense/settings/preferences',
        text: 'Preferences',
        icon: <TuneIcon />,
      },
      {
        to: '/defense/settings/security',
        text: 'Security',
        icon: <SecurityIcon />,
      },
    ],
  },
];

// Main navigation items (default to defense navigation)
export const MAIN_NAV_ITEMS: NavItemConfig[] = DEFENSE_NAV_ITEMS;
