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

export const OFFICER_SEARCH_SCOPE: SearchScope = {
  property: true,
  serialNumbers: true,
  personnel: true,
  documents: true
};

export const NCO_SEARCH_SCOPE: SearchScope = {
  property: true,
  serialNumbers: true,
  personnel: true,
  documents: true
};

export const SOLDIER_SEARCH_SCOPE: SearchScope = {
  property: true,
  serialNumbers: true,
  personnel: false,
  documents: true
};
