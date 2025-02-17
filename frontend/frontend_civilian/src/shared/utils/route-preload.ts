import {
  MAIN_NAV_ITEMS,
  HELP_NAV_ITEMS,
  type NavItemConfig
} from '@components/common/navigation-config.tsx';
import type { LazyExoticComponent, ComponentType } from 'react';

interface PreloadableComponent extends LazyExoticComponent<ComponentType<any>> {
  preload?: () => Promise<void>;
}

// Combine all navigation items
const navigationConfig = [
  { items: MAIN_NAV_ITEMS },
  { items: HELP_NAV_ITEMS }
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
