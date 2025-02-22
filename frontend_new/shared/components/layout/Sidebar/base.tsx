import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  styled,
  Theme,
} from '@mui/material';
import {
  Logout as LogoutIcon,
} from '@mui/icons-material';
import type { NavItemConfig } from '@shared/types/navigation';

const DRAWER_WIDTH = 240;

export interface BaseSidebarProps {
  /** Navigation items to display */
  navItems: NavItemConfig[];
  /** User role for accessibility labels */
  userRole?: string;
  /** Drawer variant */
  variant?: 'permanent' | 'temporary';
  /** Whether drawer is open (for mobile/temporary variant) */
  open?: boolean;
  /** Callback when drawer should close (for mobile/temporary variant) */
  onClose?: () => void;
  /** Callback when logout is clicked */
  onLogout?: () => void;
  /** Custom theme overrides */
  themeOverrides?: {
    backgroundColor?: string;
    textColor?: string;
    selectedColor?: string;
    hoverColor?: string;
    borderColor?: string;
  };
}

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'themeOverrides'
})<{ themeOverrides?: BaseSidebarProps['themeOverrides'] }>(({ theme, themeOverrides }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: themeOverrides?.backgroundColor || 'rgba(18, 18, 18, 0.95)',
    borderRight: `1px solid ${themeOverrides?.borderColor || 'rgba(255, 255, 255, 0.06)'}`,
    backdropFilter: 'blur(20px)',
    top: theme.mixins.toolbar.minHeight,
    height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      left: 0,
    },
  },
}));

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'themeOverrides'
})<{ themeOverrides?: BaseSidebarProps['themeOverrides'] }>(({ theme, themeOverrides }) => ({
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1.25, 2),
  borderRadius: 0,
  backgroundColor: 'transparent',
  color: themeOverrides?.textColor || 'rgba(255, 255, 255, 0.7)',
  transition: theme.transitions.create(
    ['background-color', 'color', 'border-color', 'box-shadow'],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }
  ),
  '&:hover': {
    backgroundColor: themeOverrides?.hoverColor || 'rgba(255, 255, 255, 0.04)',
    color: '#FFFFFF',
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
      transform: 'translateX(2px)',
    },
  },
  '&.Mui-selected': {
    backgroundColor: themeOverrides?.selectedColor || '#1A1A1A',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: themeOverrides?.hoverColor || '#202020',
    },
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
  },
  '& .MuiListItemIcon-root': {
    color: themeOverrides?.textColor || 'rgba(255, 255, 255, 0.7)',
    minWidth: 40,
    transition: theme.transitions.create(['color', 'transform'], {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  '& .MuiListItemText-primary': {
    fontSize: '0.875rem',
    fontWeight: 500,
    letterSpacing: '-0.01em',
    fontFamily: '"Helvetica Neue", sans-serif',
  },
  '& .MuiListItemText-secondary': {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.02em',
    fontFamily: '"Helvetica Neue", sans-serif',
    marginTop: 2,
  },
}));

const StyledDivider = styled(Divider, {
  shouldForwardProp: (prop) => prop !== 'themeOverrides'
})<{ themeOverrides?: BaseSidebarProps['themeOverrides'] }>(({ theme, themeOverrides }) => ({
  borderColor: themeOverrides?.borderColor || 'rgba(255, 255, 255, 0.06)',
  margin: theme.spacing(1.5, 0),
}));

export const BaseSidebar: React.FC<BaseSidebarProps> = ({
  navItems,
  userRole = 'User',
  variant = 'permanent',
  open = true,
  onClose,
  onLogout,
  themeOverrides,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout?.();
    navigate('login');
  };

  const drawerContent = (
    <>
      <StyledDivider themeOverrides={themeOverrides} />
      <Box
        component="nav"
        aria-label={`${userRole} Navigation Sidebar`}
        sx={{ width: '100%' }}
      >
        <List>
          {navItems.map((item) => (
            <ListItem key={item.to} disablePadding>
              <StyledListItemButton
                themeOverrides={themeOverrides}
                selected={location.pathname === item.to.replace(/^\//, '')}
                onClick={() => navigate(item.to.replace(/^\//, ''))}
                aria-current={location.pathname === item.to.replace(/^\//, '') ? 'page' : undefined}
                aria-describedby={item.description ? `nav-desc-${item.to.replace(/\//g, '-')}` : undefined}
              >
                <ListItemIcon>
                  {React.cloneElement(item.icon, { fontSize: 'small' })}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  secondary={item.description && (
                    <span id={`nav-desc-${item.to.replace(/\//g, '-')}`} className="sr-only">
                      {item.description}
                    </span>
                  )}
                />
              </StyledListItemButton>
            </ListItem>
          ))}
          <StyledDivider themeOverrides={themeOverrides} />
          <ListItem disablePadding>
            <StyledListItemButton
              themeOverrides={themeOverrides}
              onClick={handleLogout}
              aria-label="Logout from application"
              aria-describedby="logout-description"
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                secondary={
                  <span id="logout-description" className="sr-only">
                    Click to log out of your account
                  </span>
                }
              />
            </StyledListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );

  return (
    <StyledDrawer
      themeOverrides={themeOverrides}
      variant={variant}
      open={open}
      anchor={theme.direction === 'rtl' ? 'right' : 'left'}
      onClose={onClose}
      ModalProps={{
        keepMounted: true // Better mobile performance
      }}
      sx={{
        display: 'flex',
        flexShrink: 0,
      }}
    >
      {drawerContent}
    </StyledDrawer>
  );
};
