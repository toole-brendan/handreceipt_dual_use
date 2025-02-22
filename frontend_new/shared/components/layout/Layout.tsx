import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useThemeStyles } from '../../contexts';
import { Sidebar } from './index';
import { Header } from './index';
import { AppBarContent } from './mui/AppBarContent';

const Layout: React.FC = () => {
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
        userDisplayName="Distributor Test User"
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
        backgroundColor: 'transparent',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          zIndex: -1,
        },
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
      />
      {renderMainContent()}
    </Box>
  );
};

export default Layout;
