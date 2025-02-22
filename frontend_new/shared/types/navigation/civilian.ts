import { ReactElement } from 'react';
import { BaseNavigationItem, NavItemConfig } from './base';

export type CivilianSearchScope = 
  | 'global'
  | 'organization'
  | 'location'
  | 'department'
  | 'personal';

export const ADMIN_SEARCH_SCOPE: CivilianSearchScope[] = [
  'global',
  'organization',
  'location',
  'department',
  'personal'
];

export const MANAGER_SEARCH_SCOPE: CivilianSearchScope[] = [
  'organization',
  'location',
  'department',
  'personal'
];

export const USER_SEARCH_SCOPE: CivilianSearchScope[] = [
  'location',
  'department',
  'personal'
];

export interface CivilianNavigationItem extends BaseNavigationItem {
  // Civilian-specific navigation properties
  category?: 'inventory' | 'shipments' | 'transactions' | 'reports' | 'admin';
  organizationId?: string;
  locationId?: string;
  searchScope?: CivilianSearchScope;
}

export interface CivilianNavItemConfig extends NavItemConfig {
  // Civilian-specific component navigation properties
  category?: 'inventory' | 'shipments' | 'transactions' | 'reports' | 'admin';
  organizationId?: string;
  locationId?: string;
  searchScope?: CivilianSearchScope;
  children?: CivilianNavItemConfig[];
}

export interface CivilianNavigationGroup {
  id: string;
  label: string;
  items: CivilianNavItemConfig[];
  category?: 'inventory' | 'shipments' | 'transactions' | 'reports' | 'admin';
  searchScope?: CivilianSearchScope;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface CivilianNavigationConfig {
  mainNav: CivilianNavItemConfig[];
  secondaryNav: CivilianNavItemConfig[];
  utilityNav: CivilianNavItemConfig[];
  groups?: CivilianNavigationGroup[];
}
