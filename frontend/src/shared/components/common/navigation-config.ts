// frontend/src/ui/components/common/navigation-config.ts

import { lazy } from 'react';
import type { ComponentType } from 'react';

export interface NavItem {
  to: string;
  icon: string;
  text: string;
  component?: React.LazyExoticComponent<ComponentType<any>>;
}

export const OFFICER_NAV_ITEMS: NavItem[] = [
  {
    to: '/property',
    icon: 'inventory_2',
    text: 'My Property'
  },
  {
    to: '/transfers',
    icon: 'swap_horiz',
    text: 'Transfer Requests'
  },
  {
    to: '/property/unit',
    icon: 'library_books',
    text: 'Unit Property Book'
  },
  {
    to: '/property/sensitive',
    icon: 'security',
    text: 'Sensitive Items'
  },
  {
    to: '/personnel',
    icon: 'people',
    text: 'Personnel View'
  },
  {
    to: '/maintenance',
    icon: 'build',
    text: 'Maintenance'
  },
  {
    to: '/reports',
    icon: 'assessment',
    text: 'Reports'
  },
  {
    to: '/history',
    icon: 'history',
    text: 'History'
  },
  {
    to: '/settings',
    icon: 'settings',
    text: 'Settings'
  }
];

export const NCO_NAV_ITEMS: NavItem[] = [
  {
    to: '/property',
    icon: 'inventory_2',
    text: 'My Property'
  },
  {
    to: '/transfers',
    icon: 'swap_horiz',
    text: 'Transfer Requests'
  },
  {
    to: '/nco/squad',
    icon: 'groups',
    text: 'Squad Dashboard'
  },
  {
    to: '/personnel',
    icon: 'people',
    text: 'Personnel View'
  },
  {
    to: '/maintenance',
    icon: 'build',
    text: 'Maintenance'
  },
  {
    to: '/history',
    icon: 'history',
    text: 'History'
  },
  {
    to: '/settings',
    icon: 'settings',
    text: 'Settings'
  }
];

export const SOLDIER_NAV_ITEMS: NavItem[] = [
  {
    to: '/property',
    icon: 'inventory_2',
    text: 'My Property'
  },
  {
    to: '/transfers',
    icon: 'swap_horiz',
    text: 'Transfer Requests'
  },
  {
    to: '/maintenance',
    icon: 'build',
    text: 'Maintenance'
  },
  {
    to: '/history',
    icon: 'history',
    text: 'History'
  },
  {
    to: '/settings',
    icon: 'settings',
    text: 'Settings'
  }
]; 