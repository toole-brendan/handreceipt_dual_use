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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    top: theme.mixins.toolbar.minHeight,
    height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
  }
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
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
    }
  }
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  minWidth: 40,
  color: 'rgba(255, 255, 255, 0.7)',
}));

const StyledDivider = styled(Divider)(() => ({
  borderColor: 'rgba(255, 255, 255, 0.1)',
  margin: '8px 0',
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
