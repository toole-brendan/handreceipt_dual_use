import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { Menu, X } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { colors } from '../../styles/theme/colors';

const DRAWER_WIDTH = 280;
const APPBAR_HEIGHT = 64;

const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${colors.divider}`,
          boxShadow: 'none'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            {mobileOpen ? <X /> : <Menu />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="text.primary">
            Pharmaceutical Supply Chain
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${colors.divider}`,
              bgcolor: 'background.paper'
            },
          }}
        >
          <Sidebar 
            variant="temporary"
            isMobile={true}
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${colors.divider}`,
              bgcolor: 'background.paper'
            },
          }}
          open
        >
          <Sidebar 
            variant="permanent"
            isMobile={false}
          />
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          mt: `${APPBAR_HEIGHT}px`
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
