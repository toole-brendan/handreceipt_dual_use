export * from './base';
export * from './civilian';
export * from './defense';

// Re-export specific types with more descriptive names
export type { BaseNavigationItem as NavigationItem } from './base';
export type { BaseNavigationConfig as NavigationConfig } from './base';
export type { BaseNavigationState as NavigationState } from './base';
export type { BaseNavigationContext as NavigationContext } from './base';
export type { BaseBreadcrumbItem as BreadcrumbItem } from './base';
export type { BaseNavigationGroup as NavigationGroup } from './base';

// Re-export civilian types
export type { CivilianSearchScope as CivilianScope } from './civilian';
export type { CivilianNavigationItem as CivilianNavItem } from './civilian';
export type { CivilianNavigationConfig as CivilianConfig } from './civilian';
export type { CivilianNavigationGroup as CivilianGroup } from './civilian';

// Re-export defense types
export type { DefenseSearchScope as DefenseScope } from './defense';
export type { DefenseNavigationItem as DefenseNavItem } from './defense';
export type { DefenseNavigationConfig as DefenseConfig } from './defense';
export type { DefenseNavigationGroup as DefenseGroup } from './defense';

// Re-export search scope constants
export {
  ADMIN_SEARCH_SCOPE,
  MANAGER_SEARCH_SCOPE,
  USER_SEARCH_SCOPE,
} from './civilian';

export {
  COMMANDER_SEARCH_SCOPE,
  OFFICER_SEARCH_SCOPE,
  NCO_SEARCH_SCOPE,
  SOLDIER_SEARCH_SCOPE,
} from './defense';
