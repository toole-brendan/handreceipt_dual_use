import React, { useState } from 'react';
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
  Collapse,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { RootState, BaseState } from '../../store';
import {
  CIVILIAN_NAV_ITEMS,
  HELP_NAV_ITEMS,
} from '../common/navigation-config';
import { NavItemConfig } from '@shared/types/navigation/base';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  variant: 'permanent' | 'temporary';
  isMobile: boolean;
  open?: boolean;
  onClose?: () => void;
}

interface UserState {
  id: string;
  name: string;
  role: 'civilian' | 'officer' | 'nco' | 'soldier';
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
    top: theme.mixins.toolbar.minHeight,
    height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      left: 0,
    },
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }: { theme: Theme }) => ({
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1, 2),
  borderRadius: 0,
  backgroundColor: 'transparent',
  color: 'rgba(255, 255, 255, 0.7)',
  transition: theme.transitions.create(
    ['background-color', 'color'],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }
  ),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
  },
  '&.Mui-selected': {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#202020',
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
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
    fontFamily: '"Helvetica Neue", sans-serif',
  },
  '& .MuiListItemText-secondary': {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.02em',
    fontFamily: '"Helvetica Neue", sans-serif',
  },
}));

const StyledDivider = styled(Divider)(({ theme }: { theme: Theme }) => ({
  borderColor: 'rgba(255, 255, 255, 0.1)',
  margin: theme.spacing(1, 0),
}));

const ExpandIcon = styled(ChevronRightIcon, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ expanded }) => ({
  transition: 'transform 0.2s',
  transform: expanded ? 'rotate(90deg)' : 'none',
  marginLeft: 'auto',
  fontSize: '1.25rem',
  opacity: 0.7,
}));

const Sidebar: React.FC<SidebarProps> = ({ variant, open = true, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const authState = useSelector((state: RootState<BaseState>) => state.auth);
  const user = authState.user as UserState | null;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemClick = (item: NavItemConfig) => {
    navigate(item.to);
  };

  const isItemSelected = (path: string) => location.pathname === path;
  const roleLabel = 'Navigation';

  const drawerContent = (
    <>
      <Box
        component="nav"
        aria-label={`${roleLabel} Sidebar`}
        sx={{ width: '100%' }}
      >
        <List>
          {CIVILIAN_NAV_ITEMS.map((item) => (
            <ListItem key={item.to} disablePadding>
              <StyledListItemButton
                selected={isItemSelected(item.to)}
                onClick={() => handleItemClick(item)}
                aria-current={isItemSelected(item.to) ? 'page' : undefined}
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
          {HELP_NAV_ITEMS.map((item) => (
            <ListItem key={item.to} disablePadding>
              <StyledListItemButton
                selected={isItemSelected(item.to)}
                onClick={() => navigate(item.to)}
                aria-current={isItemSelected(item.to) ? 'page' : undefined}
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
        </List>
      </Box>
    </>
  );

  return (
    <StyledDrawer
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

export default Sidebar;
