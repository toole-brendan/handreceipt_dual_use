import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { Outlet } from 'react-router-dom';

const DRAWER_WIDTH = 240;
const APPBAR_HEIGHT = 64;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#000000' }}>
      <Header isMobile={isMobile} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="nav"
        sx={{ 
          width: { md: DRAWER_WIDTH }, 
          flexShrink: { md: 0 },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Sidebar 
          variant={isMobile ? "temporary" : "permanent"}
          isMobile={isMobile}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
        />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          mt: `${APPBAR_HEIGHT}px`,
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
