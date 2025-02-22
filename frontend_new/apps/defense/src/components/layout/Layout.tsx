import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Header } from '@shared/components/layout';
import { AppBarContent } from '@shared/components/layout/mui/AppBarContent';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212' }}>
      <Header isMobile={isMobile} onDrawerToggle={handleDrawerToggle}>
        <AppBarContent
          isMobile={isMobile}
          onDrawerToggle={handleDrawerToggle}
          userDisplayName="Military User"
        />
      </Header>
      
      <Sidebar
        variant={isMobile ? "temporary" : "permanent"}
        open={mobileOpen}
        onClose={handleDrawerToggle}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 280px)` },
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
    </Box>
  );
};

export default Layout;
