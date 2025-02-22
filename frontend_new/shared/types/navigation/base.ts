import { ReactElement } from 'react';

export type NavigationEventType = 
  | 'route_change'
  | 'breadcrumb_update'
  | 'nav_error'
  | 'nav_start'
  | 'nav_end';

export interface NavigationEvent {
  type: NavigationEventType;
  payload: {
    path?: string;
    error?: string;
    breadcrumbs?: BaseBreadcrumbItem[];
  };
}

// Base interface for navigation items
export interface BaseNavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string | ReactElement;
  requiredPermissions?: string[];
  children?: BaseNavigationItem[];
  disabled?: boolean;
  hidden?: boolean;
  badge?: {
    content: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
}

// Interface for component-specific navigation items
export type NavItemConfig = {
  to: string;
  text: string;
  icon: ReactElement;
  description?: string;
  id?: string;
  label?: string;
  path?: string;
  requiredPermissions?: string[];
  children?: NavItemConfig[];
  disabled?: boolean;
  hidden?: boolean;
  badge?: {
    content: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
};

export interface BaseNavigationGroup {
  id: string;
  label: string;
  items: NavItemConfig[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface BaseBreadcrumbItem {
  label: string;
  path: string;
  icon?: string | ReactElement;
}

export interface BaseNavigationConfig {
  mainNav: NavItemConfig[];
  secondaryNav: NavItemConfig[];
  utilityNav: NavItemConfig[];
  groups?: BaseNavigationGroup[];
}

export interface BaseNavigationState {
  currentPath: string;
  previousPath?: string;
  breadcrumbs: BaseBreadcrumbItem[];
  isNavigating: boolean;
  error?: string;
}

export interface BaseNavigationContext {
  config: BaseNavigationConfig;
  state: BaseNavigationState;
  navigate: (path: string) => void;
  goBack: () => void;
  updateBreadcrumbs: (breadcrumbs: BaseNavigationState['breadcrumbs']) => void;
}
