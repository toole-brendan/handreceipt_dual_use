import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Header } from '@shared/components/layout';
import { AppBarContent } from '@shared/components/layout/mui';
import { Sidebar } from '@shared/components/layout';
import { DEFENSE_NAV_ITEMS } from '@shared/components/common/navigation-config';
import { NavItemConfig } from '@shared/types/navigation/base';
import { useThemeStyles } from '@shared/contexts';

interface LayoutProps {
  navItems: NavItemConfig[];
}

const Layout: React.FC<LayoutProps> = ({ navItems }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const themeStyles = useThemeStyles();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderHeader = () => (
    <Header isMobile={isMobile} onDrawerToggle={handleDrawerToggle}>
      <AppBarContent
        isMobile={isMobile}
        onDrawerToggle={handleDrawerToggle}
        userDisplayName="CPT John Doe"
      />
    </Header>
  );

  const renderMainContent = () => (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { md: `calc(100% - 240px)` },
        minHeight: '100vh',
        mt: `64px`,
        backgroundColor: themeStyles.semantic.background.primary,
      }}
    >
      <Outlet />
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: themeStyles.semantic.background.primary,
      color: themeStyles.semantic.text.primary,
    }}>
      {renderHeader()}
      <Sidebar
        variant={isMobile ? "temporary" : "permanent"}
        isMobile={isMobile}
        open={mobileOpen}
        onClose={handleDrawerToggle}
        navItems={navItems}
      />
      {renderMainContent()}
    </Box>
  );
};

export default Layout; 