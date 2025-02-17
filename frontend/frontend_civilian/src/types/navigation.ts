import type { ReactElement, LazyExoticComponent, ComponentType } from 'react';

export interface SearchScope {
  property: boolean;
  serialNumbers: boolean;
  personnel: boolean;
  documents: boolean;
}

export interface NavItemConfig {
  to: string;
  text: string;
  icon: ReactElement;
  description?: string;
  end?: boolean;
  component?: LazyExoticComponent<ComponentType<any>>;
}

// Civilian-specific search scope
export const CIVILIAN_SEARCH_SCOPE: SearchScope = {
  property: true,
  serialNumbers: true,
  personnel: false,  // Civilians don't have personnel search access
  documents: true
};
