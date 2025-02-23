import React from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Extension as ExtensionIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import ProfileSettings from '@components/settings/ProfileSettings';
import AccountSettings from '@components/settings/AccountSettings';
import NotificationSettings from '@components/settings/NotificationSettings';
import IntegrationSettings from '@components/settings/IntegrationSettings';
import BlockchainSettings from '@components/settings/BlockchainSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

export const SettingsPage: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setMenuAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMenuSelect = (index: number) => {
    setValue(index);
    handleMenuClose();
  };

  const handleSave = () => {
    // Implement save functionality here
    setShowSaveSuccess(true);
  };

  const tabs = [
    { label: 'Profile', icon: <PersonIcon />, component: <ProfileSettings onSave={handleSave} /> },
    { label: 'Account', icon: <SecurityIcon />, component: <AccountSettings onSave={handleSave} /> },
    { label: 'Notifications', icon: <NotificationsIcon />, component: <NotificationSettings onSave={handleSave} /> },
    { label: 'Integrations', icon: <ExtensionIcon />, component: <IntegrationSettings onSave={handleSave} /> },
    { label: 'Blockchain', icon: <WalletIcon />, component: <BlockchainSettings onSave={handleSave} /> },
  ];

  return (
    <Container maxWidth={false}>
      <Box sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          {isMobile ? (
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleMenuClick}
                startIcon={tabs[value].icon}
              >
                {tabs[value].label}
              </Button>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                {tabs.map((tab, index) => (
                  <MenuItem
                    key={tab.label}
                    onClick={() => handleMenuSelect(index)}
                    selected={value === index}
                  >
                    {tab.icon}
                    <Typography sx={{ ml: 1 }}>{tab.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="settings tabs"
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 50,
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.label}
                  icon={tab.icon}
                  label={tab.label}
                  {...a11yProps(index)}
                  sx={{
                    '&.Mui-selected': {
                      fontWeight: 'bold',
                      borderBottom: 2,
                      borderColor: 'primary.main',
                    },
                  }}
                />
              ))}
            </Tabs>
          )}

          {tabs.map((tab, index) => (
            <TabPanel key={tab.label} value={value} index={index}>
              {tab.component}
            </TabPanel>
          ))}

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ width: 120, height: 40 }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSaveSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Settings saved successfully
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 