import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  TextField,
  Switch,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  Business as CompanyIcon,
  Language as RegionIcon,
  VerifiedUser as CertificationIcon,
  AccountBalanceWallet as WalletIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Extension as IntegrationsIcon,
  Settings as AdvancedIcon,
  Save as SaveIcon,
  Help as HelpIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { CivilianChip } from '../../components/common/CivilianChip';

// Mock data for settings
const mockSettingsData = {
  company: {
    name: "Premium Coffee Traders",
    logo: "/logo.png",
    locations: [
      { type: "Headquarters", address: "123 Coffee Lane, Seattle, WA" },
      { type: "Warehouse", address: "456 Port Way, Oakland, CA" },
    ],
    sustainabilitySlogan: "Carbon-Neutral Since 2022",
    preferences: {
      units: "kg",
      language: "en",
      timezone: "America/Los_Angeles",
    },
  },
  certifications: [
    {
      name: "Fair Trade",
      status: "active",
      expiry: "2025-03-15",
      nftId: "0x123...abc",
      lastAudit: "2024-01-15",
    },
    {
      name: "Organic",
      status: "active",
      expiry: "2025-01-20",
      nftId: "0x456...def",
      lastAudit: "2024-01-20",
    },
    {
      name: "Rainforest Alliance",
      status: "pending",
      expiry: "2024-12-31",
      nftId: "0x789...ghi",
      lastAudit: "2024-02-01",
    },
  ],
  blockchain: {
    network: "ethereum",
    wallets: [
      {
        name: "Operations",
        address: "0x1234...5678",
        balance: { usdc: 50000, eth: 2.5 },
      },
      {
        name: "Escrow",
        address: "0x8765...4321",
        balance: { usdc: 75000, eth: 1.8 },
      },
    ],
    gasPreferences: {
      mode: "auto",
      maxGwei: 50,
      alertThreshold: 100,
    },
    privacySettings: {
      anonymizeAddresses: true,
      publicProfile: false,
    },
  },
  integrations: [
    {
      name: "QuickBooks",
      status: "connected",
      lastSync: "2024-02-22T10:00:00Z",
      apiKeyExpiry: "2024-12-31",
    },
    {
      name: "AWS IoT",
      status: "connected",
      lastSync: "2024-02-22T10:05:00Z",
      devices: [
        {
          id: "TEMP001",
          type: "Temperature",
          location: "Warehouse A",
          battery: 85,
          status: "active",
        },
        {
          id: "HUM001",
          type: "Humidity",
          location: "Warehouse A",
          battery: 92,
          status: "active",
        },
      ],
    },
  ],
  notifications: {
    channels: {
      email: true,
      sms: true,
      inApp: true,
      blockchain: true,
    },
    preferences: [
      {
        type: "Low Stock",
        email: true,
        sms: false,
        inApp: true,
        blockchain: false,
      },
      {
        type: "Shipment Delays",
        email: true,
        sms: true,
        inApp: true,
        blockchain: true,
      },
      {
        type: "Certification Expiry",
        email: true,
        sms: true,
        inApp: true,
        blockchain: false,
      },
      {
        type: "Temperature Alert",
        email: true,
        sms: true,
        inApp: true,
        blockchain: true,
      },
    ],
  },
  security: {
    twoFactor: true,
    passwordPolicy: {
      minLength: 12,
      requireSpecialChars: true,
      expiryDays: 90,
    },
    ipWhitelist: [
      "192.168.1.0/24",
      "10.0.0.0/16",
    ],
    devices: [
      {
        name: "John's iPhone",
        lastAccess: "2024-02-22T09:00:00Z",
        location: "Seattle, WA",
        status: "active",
      },
      {
        name: "Warehouse Scanner",
        lastAccess: "2024-02-22T08:30:00Z",
        location: "Oakland, CA",
        status: "active",
      },
    ],
  },
  automation: [
    {
      name: "Shipment Delay Compensation",
      trigger: "delay > 48h",
      action: "Refund 10% to escrow",
      status: "active",
    },
    {
      name: "Temperature Alert",
      trigger: "temp > 25°C",
      action: "Notify all stakeholders",
      status: "active",
    },
  ],
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Settings</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!hasChanges}
        >
          Save Changes
        </Button>
      </Stack>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Navigation */}
        <Grid item xs={12} md={3}>
          <Paper>
            <Tabs
              orientation="vertical"
              value={selectedTab}
              onChange={handleTabChange}
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              <Tab icon={<CompanyIcon />} label="General" />
              <Tab icon={<WalletIcon />} label="Blockchain" />
              <Tab icon={<IntegrationsIcon />} label="Integrations" />
              <Tab icon={<NotificationsIcon />} label="Notifications" />
              <Tab icon={<SecurityIcon />} label="Security" />
              <Tab icon={<AdvancedIcon />} label="Advanced" />
            </Tabs>
          </Paper>
        </Grid>

        {/* Settings Content */}
        <Grid item xs={12} md={6}>
          {/* General Settings */}
          <TabPanel value={selectedTab} index={0}>
            <Stack spacing={3}>
              {/* Company Profile */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Company Profile</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={mockSettingsData.company.logo}
                        sx={{ width: 64, height: 64 }}
                      />
                      <Button startIcon={<UploadIcon />}>
                        Upload Logo
                      </Button>
                    </Stack>
                    <TextField
                      label="Company Name"
                      value={mockSettingsData.company.name}
                      fullWidth
                    />
                    <TextField
                      label="Sustainability Slogan"
                      value={mockSettingsData.company.sustainabilitySlogan}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Regional Settings */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Regional Settings</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          label="Units"
                          value={mockSettingsData.company.preferences.units}
                          fullWidth
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="kg">Kilograms (kg)</option>
                          <option value="lb">Pounds (lb)</option>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          label="Language"
                          value={mockSettingsData.company.preferences.language}
                          fullWidth
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          label="Timezone"
                          value={mockSettingsData.company.preferences.timezone}
                          fullWidth
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="America/New_York">Eastern Time</option>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Certifications</Typography>
                    <List>
                      {mockSettingsData.certifications.map((cert) => (
                        <ListItem key={cert.name}>
                          <ListItemIcon>
                            <CertificationIcon color={cert.status === 'active' ? 'success' : 'warning'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={cert.name}
                            secondary={`Expires: ${cert.expiry}`}
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              <CivilianChip
                                label={cert.status}
                                color={cert.status === 'active' ? 'success' : 'warning'}
                                size="small"
                              />
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      fullWidth
                    >
                      Add Certification
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>

          {/* Blockchain Settings */}
          <TabPanel value={selectedTab} index={1}>
            <Stack spacing={3}>
              {/* Network Configuration */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Network Configuration</Typography>
                    <TextField
                      select
                      label="Blockchain Network"
                      value={mockSettingsData.blockchain.network}
                      fullWidth
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="ethereum">Ethereum</option>
                      <option value="solana">Solana</option>
                      <option value="private">Private Chain</option>
                    </TextField>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={mockSettingsData.blockchain.gasPreferences.mode === 'auto'}
                        />
                      }
                      label="Automatic Gas Management"
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Wallets */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Connected Wallets</Typography>
                    <List>
                      {mockSettingsData.blockchain.wallets.map((wallet) => (
                        <ListItem key={wallet.address}>
                          <ListItemIcon>
                            <WalletIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={wallet.name}
                            secondary={`${wallet.address} • ${wallet.balance.usdc} USDC`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton>
                              <RefreshIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Privacy Settings</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={mockSettingsData.blockchain.privacySettings.anonymizeAddresses}
                        />
                      }
                      label="Anonymize Wallet Addresses"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={mockSettingsData.blockchain.privacySettings.publicProfile}
                        />
                      }
                      label="Public Company Profile"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>

          {/* Integrations */}
          <TabPanel value={selectedTab} index={2}>
            <Stack spacing={3}>
              {/* Third-Party Tools */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Connected Services</Typography>
                    <List>
                      {mockSettingsData.integrations.map((integration) => (
                        <ListItem key={integration.name}>
                          <ListItemIcon>
                            <IntegrationsIcon color={integration.status === 'connected' ? 'success' : 'error'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={integration.name}
                            secondary={`Last Sync: ${new Date(integration.lastSync).toLocaleString()}`}
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              <CivilianChip
                                label={integration.status}
                                color={integration.status === 'connected' ? 'success' : 'error'}
                                size="small"
                              />
                              <IconButton>
                                <RefreshIcon />
                              </IconButton>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </CardContent>
              </Card>

              {/* IoT Devices */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">IoT Devices</Typography>
                    <List>
                      {mockSettingsData.integrations[1]?.devices?.map((device) => (
                        <ListItem key={device.id}>
                          <ListItemIcon>
                            <IntegrationsIcon color={device.status === 'active' ? 'success' : 'error'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${device.type} Sensor (${device.id})`}
                            secondary={`Location: ${device.location} • Battery: ${device.battery}%`}
                          />
                          <ListItemSecondaryAction>
                            <CivilianChip
                              label={device.status}
                              color={device.status === 'active' ? 'success' : 'error'}
                              size="small"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      fullWidth
                    >
                      Add Device
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>

          {/* Notifications */}
          <TabPanel value={selectedTab} index={3}>
            <Stack spacing={3}>
              {/* Notification Channels */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Notification Channels</Typography>
                    {Object.entries(mockSettingsData.notifications.channels).map(([channel, enabled]) => (
                      <FormControlLabel
                        key={channel}
                        control={<Switch checked={enabled} />}
                        label={channel.charAt(0).toUpperCase() + channel.slice(1)}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Alert Settings</Typography>
                    <List>
                      {mockSettingsData.notifications.preferences.map((pref) => (
                        <ListItem key={pref.type}>
                          <ListItemText primary={pref.type} />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              {Object.entries(pref).map(([key, value]) => {
                                if (key !== 'type' && value) {
                                  return (
                                    <CivilianChip
                                      key={key}
                                      label={key}
                                      color="info"
                                      size="small"
                                    />
                                  );
                                }
                                return null;
                              })}
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>

          {/* Security */}
          <TabPanel value={selectedTab} index={4}>
            <Stack spacing={3}>
              {/* Security Settings */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Security Settings</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={mockSettingsData.security.twoFactor}
                        />
                      }
                      label="Two-Factor Authentication"
                    />
                    <TextField
                      type="number"
                      label="Password Expiry (days)"
                      value={mockSettingsData.security.passwordPolicy.expiryDays}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* IP Whitelist */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">IP Whitelist</Typography>
                    <List>
                      {mockSettingsData.security.ipWhitelist.map((ip) => (
                        <ListItem key={ip}>
                          <ListItemText primary={ip} />
                          <ListItemSecondaryAction>
                            <IconButton size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      fullWidth
                    >
                      Add IP Range
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Connected Devices */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Connected Devices</Typography>
                    <List>
                      {mockSettingsData.security.devices.map((device) => (
                        <ListItem key={device.name}>
                          <ListItemText
                            primary={device.name}
                            secondary={`Last access: ${new Date(device.lastAccess).toLocaleString()} • ${device.location}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>

          {/* Advanced */}
          <TabPanel value={selectedTab} index={5}>
            <Stack spacing={3}>
              {/* Automation Rules */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Automation Rules</Typography>
                    <List>
                      {mockSettingsData.automation.map((rule) => (
                        <ListItem key={rule.name}>
                          <ListItemText
                            primary={rule.name}
                            secondary={`Trigger: ${rule.trigger} • Action: ${rule.action}`}
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              <CivilianChip
                                label={rule.status}
                                color={rule.status === 'active' ? 'success' : 'warning'}
                                size="small"
                              />
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      fullWidth
                    >
                      Add Automation Rule
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Data Management</Typography>
                    <Button
                      startIcon={<UploadIcon />}
                      variant="outlined"
                      fullWidth
                    >
                      Export All Data
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      fullWidth
                    >
                      Clear All Data
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>
        </Grid>

        {/* Right Sidebar - Help */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HelpIcon color="primary" />
                  <Typography variant="h6">Help & Support</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Need help configuring your settings? Check out our guides or contact support.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<HelpIcon />}
                  fullWidth
                >
                  View Documentation
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Tooltip title="Save Changes">
          <IconButton
            color="primary"
            disabled={!hasChanges}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <SaveIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default SettingsPage; 