import React from 'react';
import { useLocation, Outlet, Navigate } from 'react-router-dom';
import { Box, useTheme, useMediaQuery, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DEFENSE_ROUTES } from '../../constants/routes';
import env from '../../config/env';
import { DefenseSidebar } from './';
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                marginRight: 2,
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            sx={{
              border: '1px solid rgba(255, 255, 255, 0.7)',
              padding: '6px 16px',
              marginRight: 2,
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 },
            }}
          >
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontSize: '1.125rem',
                fontWeight: 300,
                letterSpacing: '0.05em',
                color: '#FFFFFF',
                margin: 0,
                fontFamily: 'Georgia, serif',
              }}
            >
              HandReceipt
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <DefenseSidebar />
      
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
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default Layout;
