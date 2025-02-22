import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  styled,
  Drawer,
  Divider
} from '@mui/material';
import {
  LayoutDashboard,
  Box as BoxIcon,
  Warehouse,
  ArrowLeftRight,
  Wrench,
  BarChart2,
  Users,
  Settings,
  HelpCircle
} from 'lucide-react';
import { DEFENSE_ROUTES } from '../../constants/routes';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(20px)',
    top: theme.mixins.toolbar.minHeight,
    height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
  }
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1.25, 2),
  borderRadius: 0,
  color: 'rgba(255, 255, 255, 0.7)',
  transition: theme.transitions.create(
    ['background-color', 'color', 'transform', 'box-shadow'],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }
  ),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: '#FFFFFF',
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
      transform: 'translateX(2px)',
    },
  },
  '&.Mui-selected': {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#202020',
    },
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    }
  }
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  minWidth: 40,
  color: 'rgba(255, 255, 255, 0.7)',
  transition: 'all 0.2s ease-in-out',
}));

const StyledDivider = styled(Divider)(() => ({
  borderColor: 'rgba(255, 255, 255, 0.06)',
  margin: '12px 0',
}));

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: DEFENSE_ROUTES.DASHBOARD,
    icon: <LayoutDashboard size={24} />
  },
  {
    title: 'My Property',
    path: DEFENSE_ROUTES.PROPERTY,
    icon: <BoxIcon size={24} />
  },
  {
    title: 'Unit Inventory',
    path: DEFENSE_ROUTES.UNIT_INVENTORY,
    icon: <Warehouse size={24} />
  },
  {
    title: 'Transfers',
    path: DEFENSE_ROUTES.TRANSFERS,
    icon: <ArrowLeftRight size={24} />
  },
  {
    title: 'Maintenance',
    path: DEFENSE_ROUTES.MAINTENANCE,
    icon: <Wrench size={24} />
  },
  {
    title: 'Reports',
    path: DEFENSE_ROUTES.REPORTS,
    icon: <BarChart2 size={24} />
  },
  {
    title: 'User Management',
    path: DEFENSE_ROUTES.USERS,
    icon: <Users size={24} />
  },
  {
    title: 'Settings',
    path: DEFENSE_ROUTES.SETTINGS,
    icon: <Settings size={24} />
  },
  {
    title: 'Help',
    path: DEFENSE_ROUTES.HELP,
    icon: <HelpCircle size={24} />
  }
];

interface SidebarProps {
  variant?: 'permanent' | 'temporary';
  open?: boolean;
  onClose?: () => void;
}

const Sidebar: FC<SidebarProps> = ({ variant = 'permanent', open = true, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarContent = (
    <Box>
      <StyledDivider />
      <List sx={{ px: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <StyledListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
            >
              <StyledListItemIcon>{item.icon}</StyledListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (variant === 'temporary') {
    return (
      <StyledDrawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
        }}
      >
        {sidebarContent}
      </StyledDrawer>
    );
  }

  return (
    <StyledDrawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
      }}
      open
    >
      {sidebarContent}
    </StyledDrawer>
  );
};

export default Sidebar;
