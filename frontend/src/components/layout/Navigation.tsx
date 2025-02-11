/* frontend/src/shared/components/layout/Navigation.tsx */

import React from 'react';
import Sidebar from './Sidebar';
import { BreadcrumbProvider } from '../navigation/breadcrumb/BreadcrumbContext';

interface NavigationProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ open, onClose, isMobile }) => {
  return (
    <BreadcrumbProvider>
      <Sidebar 
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={onClose}
        isMobile={isMobile}
      />
    </BreadcrumbProvider>
  );
};

export default Navigation;
