import { 
  OFFICER_NAV_ITEMS, 
  NCO_NAV_ITEMS, 
  SOLDIER_NAV_ITEMS
} from '@/components/common/navigation-config';
import type { NavItemConfig } from '@/types/navigation';
import type { LazyExoticComponent, ComponentType } from 'react';

interface PreloadableComponent extends LazyExoticComponent<ComponentType<any>> {
  preload?: () => Promise<void>;
}

// Combine all navigation items
const navigationConfig = [
  { items: OFFICER_NAV_ITEMS },
  { items: NCO_NAV_ITEMS },
  { items: SOLDIER_NAV_ITEMS }
];

interface NavSection {
  items: NavItemConfig[];
}

export const preloadRoute = (path: string) => {
  const route = navigationConfig
    .flatMap((section: NavSection) => section.items)
    .find((item: NavItemConfig) => item.to === path);

  if (route?.component && (route.component as PreloadableComponent).preload) {
    (route.component as PreloadableComponent).preload?.();
  }
};
