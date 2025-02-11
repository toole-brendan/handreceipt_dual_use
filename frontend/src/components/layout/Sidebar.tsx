import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  IconButton,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { RootState } from '@/store/store';
import {
  OFFICER_NAV_ITEMS,
  NCO_NAV_ITEMS,
  SOLDIER_NAV_ITEMS,
  type NavItemConfig,
} from '@/components/common/navigation-config';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  variant: 'permanent' | 'temporary';
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

interface UserState {
  id: string;
  name: string;
  rank: string;
  role: 'officer' | 'nco' | 'soldier';
  classification: string;
  permissions: string[];
}

const StyledDrawer = styled(Drawer)(({ theme }: { theme: Theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    paddingTop: theme.mixins.toolbar.minHeight,
    [theme.breakpoints.down('md')]: {
      width: '100%',
      paddingTop: theme.mixins.toolbar.minHeight,
    },
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }: { theme: Theme }) => ({
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1, 2),
  borderRadius: 0,
  backgroundColor: 'transparent',
  color: 'rgba(255, 255, 255, 0.7)',
  transition: theme.transitions.create(
    ['background-color', 'color', 'border-color', 'box-shadow'],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }
  ),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: '#FFFFFF',
    borderLeft: '2px solid #FFFFFF',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
  },
  '& .MuiListItemIcon-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    minWidth: 40,
    transition: theme.transitions.create('color'),
  },
  '& .MuiListItemText-primary': {
    fontSize: '0.875rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
    fontFamily: 'Inter, sans-serif',
  },
  '& .MuiListItemText-secondary': {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.01em',
    fontFamily: 'Inter, sans-serif',
  },
  [theme.breakpoints.down('md')]: {
    margin: theme.spacing(0.5, 2),
    padding: theme.spacing(1.5, 2),
  },
}));

const StyledDivider = styled(Divider)(({ theme }: { theme: Theme }) => ({
  borderColor: 'rgba(255, 255, 255, 0.1)',
  margin: theme.spacing(1, 0),
}));

const Sidebar: React.FC<SidebarProps> = ({ variant, open, onClose, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const authState = useSelector((state: RootState) => state.auth);
  const user = authState.user as UserState | null;

  const getNavItems = (): NavItemConfig[] => {
    if (!user?.role) return SOLDIER_NAV_ITEMS;
    
    const normalizedRole = user.role.toLowerCase();
    switch (normalizedRole) {
      case 'officer':
        return OFFICER_NAV_ITEMS;
      case 'nco':
        return NCO_NAV_ITEMS;
      case 'soldier':
        return SOLDIER_NAV_ITEMS;
      default:
        return SOLDIER_NAV_ITEMS;
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    navigate('login');
    if (isMobile) {
      onClose();
    }
  };

  const handleNavigation = (to: string) => {
    navigate(to.replace(/^\//, ''));
    if (isMobile) {
      onClose();
    }
  };

  const navItems = getNavItems();
  const roleLabel = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'User';

  const drawerContent = (
    <>
      {isMobile && (
        <DrawerHeader>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
      )}
      <StyledDivider />
      <Box
        component="nav"
        aria-label={`${roleLabel} Navigation Sidebar`}
        sx={{ width: '100%' }}
      >
        <List>
          {navItems.map((item) => (
            <ListItem key={item.to} disablePadding>
              <StyledListItemButton
                selected={location.pathname === item.to.replace(/^\//, '')}
                onClick={() => handleNavigation(item.to)}
                aria-current={location.pathname === item.to.replace(/^\//, '') ? 'page' : undefined}
                aria-describedby={item.description ? `nav-desc-${item.to.replace(/\//g, '-')}` : undefined}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
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
          <StyledDivider />
          <ListItem disablePadding>
            <StyledListItemButton
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
      variant={variant}
      open={open}
      onClose={onClose}
      anchor={theme.direction === 'rtl' ? 'right' : 'left'}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
    >
      {drawerContent}
    </StyledDrawer>
  );
};

export default Sidebar;
