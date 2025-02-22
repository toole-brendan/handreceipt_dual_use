import { FC, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { ArmyLogo } from '@shared/components/common';
import { AccountSettings } from './components/AccountSettings';
import { NotificationSettings } from './components/NotificationSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { SystemSettings } from './components/SystemSettings';

type SettingsCategory = 'account' | 'notifications' | 'security' | 'system';

const SettingsPage: FC = () => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('account');
  const [lastSynced, setLastSynced] = useState('2 minutes ago');

  const handleRefresh = async () => {
    // TODO: Implement blockchain sync
    console.log('Syncing with blockchain...');
    setLastSynced('just now');
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'system':
        return <SystemSettings />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <ArmyLogo sx={{ width: 50, height: 50, mr: 2, color: '#ffffff' }} />
          <Box>
            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              Settings
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#999999' }}>
              Captain John Doe, Company Commander, F CO - 2-506, 3BCT, 101st Airborne
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={handleRefresh} 
            sx={{ 
              color: '#ffffff',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <RefreshCw size={24} />
          </IconButton>
          
          <Chip
            icon={<CheckCircle size={16} color="#00ff00" />}
            label={`Blockchain Synced: ${lastSynced}`}
            sx={{ 
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              '& .MuiChip-label': { color: '#ffffff' }
            }}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Sidebar */}
        <Paper 
          sx={{ 
            width: 240, 
            backgroundColor: '#2a2a2a',
            flexShrink: 0,
            borderRadius: 2
          }}
        >
          <List>
            {[
              { id: 'account', label: 'Account' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'security', label: 'Security' },
              { id: 'system', label: 'System' },
            ].map((category) => (
              <ListItem key={category.id} disablePadding>
                <ListItemButton
                  selected={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id as SettingsCategory)}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: '#404040',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#505050',
                      },
                    },
                    '&:hover': {
                      backgroundColor: '#333333',
                    },
                  }}
                >
                  <ListItemText 
                    primary={category.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      color: activeCategory === category.id ? '#ffffff' : '#999999'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Content Area */}
        <Paper sx={{ 
          flex: 1, 
          backgroundColor: '#2a2a2a',
          borderRadius: 2,
          p: 3
        }}>
          {renderContent()}
        </Paper>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mt: 4,
          py: 1,
          px: 2,
          backgroundColor: '#2a2a2a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid #404040'
        }}
      >
        <Typography variant="body2" sx={{ color: '#999999' }}>
          HandReceipt v1.0
        </Typography>
        <Typography variant="body2" sx={{ color: '#999999' }}>
          Last Updated: 10/02/2024
        </Typography>
        <Box>
          <Typography
            component="a"
            href="#"
            sx={{
              color: '#00ff00',
              textDecoration: 'none',
              mr: 2,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Help
          </Typography>
          <Typography
            component="a"
            href="#"
            sx={{
              color: '#00ff00',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Support
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;
