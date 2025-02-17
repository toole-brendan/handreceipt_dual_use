/* frontend/src/shared/components/layout/Navigation.tsx */

import React from 'react';
import Sidebar from './Sidebar';
import { BreadcrumbProvider } from '../navigation/breadcrumb/BreadcrumbContext';

interface NavigationProps {
  isMobile: boolean;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isMobile, mobileOpen, onDrawerToggle }) => {
  return (
    <BreadcrumbProvider>
      <Sidebar 
        variant={isMobile ? "temporary" : "permanent"} 
        isMobile={isMobile}
        open={mobileOpen}
        onClose={onDrawerToggle}
      />
    </BreadcrumbProvider>
  );
};

export default Navigation;
