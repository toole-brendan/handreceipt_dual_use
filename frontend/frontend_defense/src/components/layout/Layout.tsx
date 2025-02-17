/* frontend/src/shared/components/Layout/Layout.tsx */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, styled, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Navigation from './Navigation';
import SkipLink from '../common/SkipLink';
import { Container } from './mui/Container';

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: '#000000',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'none',
    pointerEvents: 'none',
  },
}));

const AppBody = styled(Box)(() => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  position: 'relative',
  width: '100%',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: '100vh',
  backgroundColor: 'transparent',
  position: 'relative',
  marginLeft: 0,
  width: '100%',
  paddingTop: theme.mixins.toolbar.minHeight,
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
}));

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Don't show navigation on login page
  const isLoginPage = location.pathname === '/login';
  
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AppLayout>
      <SkipLink />
      <Header isMobile={isMobile} onDrawerToggle={handleDrawerToggle} />
      <AppBody>
        <Navigation isMobile={isMobile} mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
        <MainContent
          id="main"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          {/* Announce page changes to screen readers */}
          <Box
            className="sr-only"
            role="status"
            aria-live="polite"
          >
            {location.pathname.split('/').pop()?.replace('-', ' ')} page loaded
          </Box>
          <Container fluid noBorder>
            {children}
          </Container>
        </MainContent>
      </AppBody>
    </AppLayout>
  );
};

export default Layout;
