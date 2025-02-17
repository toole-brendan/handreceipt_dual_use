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
import { RootState } from '@/store/store';
import {
  MAIN_NAV_ITEMS,
  HELP_NAV_ITEMS,
  type NavItemConfig,
} from '@/components/common/navigation-config';

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
  role: string;
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
  const authState = useSelector((state: RootState) => state.auth);
  const user = authState.user as UserState | null;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const getNavItems = (): NavItemConfig[] => {
    return MAIN_NAV_ITEMS;
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    navigate('login');
  };

  const handleItemClick = (item: NavItemConfig) => {
    if (item.subItems) {
      setExpandedItems(prev => 
        prev.includes(item.to) 
          ? prev.filter(i => i !== item.to)
          : [...prev, item.to]
      );
    } else {
      navigate(item.to);
    }
  };

  const isItemExpanded = (itemPath: string) => expandedItems.includes(itemPath);
  const isItemSelected = (path: string) => location.pathname === path;
  const isParentOfCurrentRoute = (item: NavItemConfig) => 
    item.subItems?.some(subItem => isItemSelected(subItem.to));

  const navItems = getNavItems();
  const roleLabel = 'Navigation';

  const drawerContent = (
    <>
      <Box
        component="nav"
        aria-label={`${roleLabel} Sidebar`}
        sx={{ width: '100%' }}
      >
        <List>
          {navItems.map((item) => (
            <React.Fragment key={item.to}>
              <ListItem disablePadding>
                <StyledListItemButton
                  selected={isItemSelected(item.to) || isParentOfCurrentRoute(item)}
                  onClick={() => handleItemClick(item)}
                  aria-current={isItemSelected(item.to) ? 'page' : undefined}
                  aria-describedby={item.description ? `nav-desc-${item.to.replace(/\//g, '-')}` : undefined}
                  aria-expanded={item.subItems ? isItemExpanded(item.to) : undefined}
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
                  {item.subItems && (
                    <ExpandIcon expanded={isItemExpanded(item.to)} />
                  )}
                </StyledListItemButton>
              </ListItem>
              {item.subItems && (
                <Collapse in={isItemExpanded(item.to)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.to} disablePadding>
                        <StyledListItemButton
                          selected={isItemSelected(subItem.to)}
                          onClick={() => navigate(subItem.to)}
                          aria-current={isItemSelected(subItem.to) ? 'page' : undefined}
                          aria-describedby={subItem.description ? `nav-desc-${subItem.to.replace(/\//g, '-')}` : undefined}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon>{subItem.icon}</ListItemIcon>
                          <ListItemText 
                            primary={subItem.text}
                            secondary={subItem.description && (
                              <span id={`nav-desc-${subItem.to.replace(/\//g, '-')}`} className="sr-only">
                                {subItem.description}
                              </span>
                            )}
                          />
                        </StyledListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
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
