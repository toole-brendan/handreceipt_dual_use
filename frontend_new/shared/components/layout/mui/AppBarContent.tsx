import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Box,
  styled,
  Theme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

interface AppBarContentProps {
  isMobile: boolean;
  onDrawerToggle: () => void;
  userDisplayName: string;
}

const DRAWER_WIDTH = 240;

const Search = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: DRAWER_WIDTH,
  borderRadius: 0,
  backgroundColor: '#000000',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  marginRight: theme.spacing(2),
  width: '100%',
  maxWidth: '800px',
  transition: theme.transitions.create(
    ['border-color', 'box-shadow'],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }
  ),
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  '&:focus-within': {
    borderColor: '#FFFFFF',
    '& .SearchIconWrapper': {
      color: '#FFFFFF',
    },
  },
  [theme.breakpoints.up('md')]: {
    width: 'auto',
    minWidth: '500px',
  },
  [theme.breakpoints.down('md')]: {
    position: 'relative',
    left: 'auto',
    marginLeft: theme.spacing(3),
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255, 255, 255, 0.7)',
  transition: theme.transitions.create('color', {
    duration: theme.transitions.duration.shorter,
  }),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#FFFFFF',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.25, 1, 1.25, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    letterSpacing: '0.02em',
    fontSize: '0.9375rem',
    fontWeight: 400,
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
      opacity: 1,
      letterSpacing: '0.02em',
      fontWeight: 300,
    },
    '&:focus': {
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.7)',
      },
    },
  },
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  cursor: 'pointer',
  borderRadius: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: theme.transitions.create(
    ['background-color', 'transform', 'box-shadow'],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }
  ),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: '#000000',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 0,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    '& .MuiMenuItem-root': {
      transition: theme.transitions.create(
        ['background-color', 'color'],
        {
          duration: theme.transitions.duration.shorter,
          easing: theme.transitions.easing.easeInOut,
        }
      ),
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      },
    },
  },
}));

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FF3B3B',
    color: '#FFFFFF',
    boxShadow: '0 0 0 2px #000000',
  },
}));

const LogoContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1, 0, 2),
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.9,
  },
}));

const LogoBox = styled(Box)(({ theme }: { theme: Theme }) => ({
  border: '1px solid rgba(255, 255, 255, 0.7)',
  padding: theme.spacing(0.75, 2),
  marginRight: theme.spacing(2),
  '& h1': {
    fontSize: '1.125rem',
    fontWeight: 300,
    letterSpacing: '0.05em',
    color: '#FFFFFF',
    margin: 0,
    fontFamily: 'Georgia, serif',
    textTransform: 'none',
  },
}));

export const AppBarContent: React.FC<AppBarContentProps> = ({ 
  isMobile, 
  onDrawerToggle,
  userDisplayName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Toolbar sx={{ position: 'relative' }}>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
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
      <LogoContainer onClick={handleLogoClick}>
        <LogoBox>
          <h1>HandReceipt</h1>
        </LogoBox>
      </LogoContainer>

      <Search>
        <SearchIconWrapper className="SearchIconWrapper">
          <SearchIcon />
        </SearchIconWrapper>
        <form onSubmit={handleSearch} style={{ width: '100%' }}>
          <StyledInputBase
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            inputProps={{ 'aria-label': 'search' }}
          />
        </form>
      </Search>

      <Box sx={{ flexGrow: 1 }} />

      <IconButton
        size="large"
        aria-label="show notifications"
        color="inherit"
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        }}
      >
        <StyledBadge badgeContent={3} color="error">
          <NotificationsIcon />
        </StyledBadge>
      </IconButton>

      <UserInfo onClick={handleMenuOpen}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {userDisplayName.charAt(0)}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {userDisplayName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.7rem',
            }}
          >
            USER
          </Typography>
        </Box>
        <ArrowDownIcon
          sx={{
            fontSize: 20,
            color: 'text.secondary',
            transition: (theme) =>
              theme.transitions.create('transform', {
                duration: theme.transitions.duration.shorter,
              }),
            transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'none',
          }}
        />
      </UserInfo>

      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={Link} to="/profile">
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/settings">
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </StyledMenu>
    </Toolbar>
  );
};
