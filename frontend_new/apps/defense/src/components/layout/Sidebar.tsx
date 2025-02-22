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
  Drawer
} from '@mui/material';
import {
  LayoutDashboard,
  Box as BoxIcon,
  ArrowLeftRight,
  Archive,
  Wrench,
  BarChart2,
  Bell,
  Users,
  HelpCircle,
  Settings,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { DEFENSE_ROUTES } from '../../constants/routes';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected
    }
  }
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: '40px',
  color: theme.palette.text.primary
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
    title: 'Transfers',
    path: DEFENSE_ROUTES.TRANSFERS,
    icon: <ArrowLeftRight size={24} />
  },
  {
    title: 'Inventory Management',
    path: DEFENSE_ROUTES.INVENTORY,
    icon: <Archive size={24} />
  },
  {
    title: 'Maintenance & Inspections',
    path: DEFENSE_ROUTES.MAINTENANCE,
    icon: <Wrench size={24} />
  },
  {
    title: 'Reports & Analytics',
    path: DEFENSE_ROUTES.REPORTS,
    icon: <BarChart2 size={24} />
  },
  {
    title: 'Alerts & Tasks',
    path: DEFENSE_ROUTES.ALERTS,
    icon: <Bell size={24} />
  },
  {
    title: 'User Management',
    path: DEFENSE_ROUTES.USERS,
    icon: <Users size={24} />
  },
  {
    title: 'Support',
    path: DEFENSE_ROUTES.SUPPORT,
    icon: <HelpCircle size={24} />
  },
  {
    title: 'Settings',
    path: DEFENSE_ROUTES.SETTINGS,
    icon: <Settings size={24} />
  },
  {
    title: 'Help',
    path: DEFENSE_ROUTES.HELP,
    icon: <QuestionIcon size={24} />
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
    <Box
      sx={{
        width: '280px',
        height: '100%',
        backgroundColor: '#1C1C1C',
        pt: 8 // Add padding top to account for AppBar
      }}
    >
      <List sx={{ p: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <StyledListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)'
                }
              }}
            >
              <StyledListItemIcon sx={{ color: 'white' }}>{item.icon}</StyledListItemIcon>
              <ListItemText primary={item.title} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '280px',
            backgroundColor: '#1C1C1C'
          }
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: '280px',
          backgroundColor: '#1C1C1C'
        }
      }}
      open
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
