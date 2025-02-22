import { ReactElement } from 'react';
import { BaseNavigationItem, NavItemConfig } from './base';

export type DefenseSearchScope = 
  | 'global'
  | 'branch'
  | 'unit'
  | 'station'
  | 'personal';

// Alias for backward compatibility
export type SearchScope = DefenseSearchScope;

export const COMMANDER_SEARCH_SCOPE: DefenseSearchScope[] = [
  'global',
  'branch',
  'unit',
  'station',
  'personal'
];

export const OFFICER_SEARCH_SCOPE: DefenseSearchScope[] = [
  'unit',
  'station',
  'personal'
];

export const NCO_SEARCH_SCOPE: DefenseSearchScope[] = [
  'station',
  'personal'
];

// Alias for backward compatibility
export const SOLDIER_SEARCH_SCOPE = NCO_SEARCH_SCOPE;

export const ENLISTED_SEARCH_SCOPE: DefenseSearchScope[] = [
  'station',
  'personal'
];

export interface DefenseNavigationItem extends BaseNavigationItem {
  // Defense-specific navigation properties
  category?: 'property' | 'personnel' | 'operations' | 'reports' | 'admin';
  branchId?: string;
  unitId?: string;
  stationId?: string;
  securityLevel?: 'unclassified' | 'confidential' | 'secret' | 'top_secret';
  searchScope?: DefenseSearchScope;
}

export interface DefenseNavItemConfig extends NavItemConfig {
  // Defense-specific component navigation properties
  category?: 'property' | 'personnel' | 'operations' | 'reports' | 'admin';
  branchId?: string;
  unitId?: string;
  stationId?: string;
  securityLevel?: 'unclassified' | 'confidential' | 'secret' | 'top_secret';
  searchScope?: DefenseSearchScope;
  children?: DefenseNavItemConfig[];
}

export interface DefenseNavigationGroup {
  id: string;
  label: string;
  items: DefenseNavItemConfig[];
  category?: 'property' | 'personnel' | 'operations' | 'reports' | 'admin';
  securityLevel?: 'unclassified' | 'confidential' | 'secret' | 'top_secret';
  searchScope?: DefenseSearchScope;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface DefenseNavigationConfig {
  mainNav: DefenseNavItemConfig[];
  secondaryNav: DefenseNavItemConfig[];
  utilityNav: DefenseNavItemConfig[];
  groups?: DefenseNavigationGroup[];
}
