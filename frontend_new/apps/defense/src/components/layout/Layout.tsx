import React from 'react';
import { useLocation, Outlet, Navigate } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DEFENSE_ROUTES } from '../../constants/routes';
import env from '../../config/env';
import { Header } from '@shared/components/layout';
import { AppBarContent } from '@shared/components/layout/mui';
import DefenseSidebar from './Sidebar';
import type { DefenseAuthState } from '@shared/types/auth/defense';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const authState = useSelector((state: RootState) => state.auth as DefenseAuthState);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Don't show navigation on auth pages
  const isAuthPage = [DEFENSE_ROUTES.LOGIN, DEFENSE_ROUTES.LOGOUT].includes(location.pathname as any);
  
  if (isAuthPage) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {children || <Outlet />}
      </Box>
    );
  }

  const renderHeader = () => (
    <Header isMobile={isMobile} onDrawerToggle={handleDrawerToggle}>
      <AppBarContent
        isMobile={isMobile}
        onDrawerToggle={handleDrawerToggle}
        userDisplayName="CPT Test User"
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
      {children || <Outlet />}
    </Box>
  );

  const renderLayout = () => (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {renderHeader()}
      <DefenseSidebar
        variant={isMobile ? "temporary" : "permanent"}
        isMobile={isMobile}
        open={mobileOpen}
        onClose={handleDrawerToggle}
      />
      {renderMainContent()}
    </Box>
  );

  // In development mode, bypass authentication check
  if (env.DEV) {
    return renderLayout();
  }

  // In production, redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to={DEFENSE_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return renderLayout();
};

export default Layout;
