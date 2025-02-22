import { FC, useState } from 'react';
import { 
  Box, 
  Typography, 
  Tab, 
  Tabs, 
  InputBase, 
  IconButton, 
  Chip,
  Paper
} from '@mui/material';
import { 
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ArmyLogo } from '@shared/components/common';
import {
  UserTable,
  UserFilters,
  RolesPermissions,
  ActivityLogs
} from './components';

const darkTheme = {
  background: '#1a1a1a',
  paper: '#2a2a2a',
  paperDark: '#333333',
  text: {
    primary: '#ffffff',
    secondary: '#999999',
  },
  accent: '#00ff00',
  error: '#ff4444',
  border: '#404040',
};

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: darkTheme.paper,
  marginLeft: 0,
  width: '300px',
  border: `1px solid ${darkTheme.border}`,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: darkTheme.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: darkTheme.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    '&::placeholder': {
      color: darkTheme.text.secondary,
      opacity: 1,
    },
  },
}));

const UserManagementPage: FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleRefresh = () => {
    // TODO: Implement blockchain sync
    console.log('Refreshing data...');
  };

  return (
    <Box sx={{ 
      p: 3,
      backgroundColor: darkTheme.background,
      minHeight: '100vh',
      color: darkTheme.text.primary
    }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <ArmyLogo sx={{ width: 50, height: 50, mr: 2, color: darkTheme.text.primary }} />
          <Box>
            <Typography variant="h4" sx={{ color: darkTheme.text.primary, fontWeight: 'bold' }}>
              User Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: darkTheme.text.secondary }}>
              Captain John Doe, Company Commander, F CO - 2-506, 3BCT, 101st Airborne
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchBar>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search by Name, Rank, or Role..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </SearchBar>
          
          <IconButton 
            onClick={handleRefresh} 
            sx={{ 
              color: darkTheme.text.primary,
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
          
          <Chip
            icon={<CheckCircleIcon sx={{ color: darkTheme.accent }} />}
            label="Blockchain Synced: 2 minutes ago"
            sx={{ 
              backgroundColor: darkTheme.paper,
              color: darkTheme.text.primary,
              '& .MuiChip-label': { 
                color: darkTheme.text.primary 
              }
            }}
          />
        </Box>
      </Box>

      {/* Tabs Section */}
      <Paper 
        sx={{ 
          mb: 3, 
          backgroundColor: darkTheme.paper,
          borderRadius: 2,
        }}
      >
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': { 
              fontSize: '14px',
              color: darkTheme.text.secondary,
              '&.Mui-selected': { 
                color: darkTheme.accent,
                fontWeight: 'bold' 
              }
            },
            '& .MuiTabs-indicator': { 
              backgroundColor: darkTheme.accent,
              height: 3 
            }
          }}
        >
          <Tab label="All Users" />
          <Tab label="Roles & Permissions" />
          <Tab label="Activity Logs" />
        </Tabs>
      </Paper>

      {/* Content Section */}
      <Paper 
        sx={{ 
          mt: 3,
          backgroundColor: darkTheme.paper,
          borderRadius: 2,
          p: 3
        }}
      >
        {currentTab === 0 && (
          <>
            <UserFilters />
            <UserTable searchQuery={searchQuery} />
          </>
        )}
        {currentTab === 1 && <RolesPermissions />}
        {currentTab === 2 && <ActivityLogs />}
      </Paper>
    </Box>
  );
};

export default UserManagementPage; 