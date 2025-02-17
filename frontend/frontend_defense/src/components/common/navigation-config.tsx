import React from 'react';
import {
  Inventory2 as Inventory2Icon,
  People as PeopleIcon,
  SwapHoriz as SwapHorizIcon,
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
  History as HistoryIcon,
  Help as HelpIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  FactCheck as FactCheckIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { NavItemConfig } from '../../types/navigation';

export const OFFICER_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/dashboard',
    icon: <DashboardIcon />,
    text: 'Command Dashboard',
    end: true
  },
  {
    to: '/property-book',
    icon: <Inventory2Icon />,
    text: 'Unit Property Book'
  },
  {
    to: '/personnel',
    icon: <PeopleIcon />,
    text: 'Personnel View'
  },
  {
    to: '/maintenance',
    icon: <BuildIcon />,
    text: 'Maintenance'
  },
  {
    to: '/inventory',
    icon: <Inventory2Icon />,
    text: 'Inventory Management'
  },
  {
    to: '/reports',
    icon: <AssignmentIcon />,
    text: 'Reports & Analytics'
  },
  {
    to: '/my-property',
    icon: <AssignmentIcon />,
    text: 'My Property'
  },
  {
    to: '/history',
    icon: <HistoryIcon />,
    text: 'History'
  },
  {
    to: '/settings',
    icon: <SettingsIcon />,
    text: 'Settings'
  }
];

export const NCO_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/dashboard',
    icon: <DashboardIcon />,
    text: 'Squad Dashboard',
    end: true
  },
  {
    to: '/inventory',
    icon: <Inventory2Icon />,
    text: 'Inventory Management'
  },
  {
    to: '/property-status',
    icon: <FactCheckIcon />,
    text: 'Property Status'
  },
  {
    to: '/maintenance',
    icon: <BuildIcon />,
    text: 'Maintenance'
  },
  {
    to: '/hand-receipts',
    icon: <ReceiptIcon />,
    text: 'Hand Receipt Management'
  },
  {
    to: '/my-property',
    icon: <AssignmentIcon />,
    text: 'My Property'
  },
  {
    to: '/history',
    icon: <HistoryIcon />,
    text: 'History'
  },
  {
    to: '/settings',
    icon: <SettingsIcon />,
    text: 'Settings'
  }
];

export const SOLDIER_NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/my-property',
    icon: <AssignmentIcon />,
    text: 'My Property',
    end: true
  },
  {
    to: '/maintenance',
    icon: <BuildIcon />,
    text: 'Maintenance'
  },
  {
    to: '/history',
    icon: <HistoryIcon />,
    text: 'History'
  },
  {
    to: '/settings',
    icon: <SettingsIcon />,
    text: 'Settings'
  }
];
