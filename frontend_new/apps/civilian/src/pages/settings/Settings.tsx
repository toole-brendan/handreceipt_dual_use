import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  AccountCircle as AccountIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  // General Settings
  const [companyName, setCompanyName] = useState('HandReceipt Inc.');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC-5');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState(true);

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelisting, setIpWhitelisting] = useState(false);

  // Payment Settings
  const [usdcEnabled, setUsdcEnabled] = useState(true);
  const [autoPayments, setAutoPayments] = useState(false);
  const [paymentThreshold, setPaymentThreshold] = useState('1000');

  const handleSave = () => {
    // TODO: Implement settings save logic
    console.log('Saving settings...');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountIcon sx={{ mr: 1 }} />
                <Typography variant="h6">General Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={language}
                      label="Language"
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={timezone}
                      label="Timezone"
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <MenuItem value="UTC-5">Eastern Time (UTC-5)</MenuItem>
                      <MenuItem value="UTC-6">Central Time (UTC-6)</MenuItem>
                      <MenuItem value="UTC-7">Mountain Time (UTC-7)</MenuItem>
                      <MenuItem value="UTC-8">Pacific Time (UTC-8)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Notification Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive updates via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Order Alerts"
                    secondary="Get notified about order updates"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={orderAlerts}
                      onChange={(e) => setOrderAlerts(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Inventory Alerts"
                    secondary="Get notified about low stock"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={inventoryAlerts}
                      onChange={(e) => setInventoryAlerts(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Security Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Enable 2FA for enhanced security"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Session Timeout (minutes)"
                    secondary="Automatically log out after inactivity"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      size="small"
                      sx={{ width: 80 }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="IP Whitelisting"
                    secondary="Restrict access to specific IP addresses"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={ipWhitelisting}
                      onChange={(e) => setIpWhitelisting(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Payment Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemText
                    primary="USDC Payments"
                    secondary="Enable USDC stablecoin payments"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={usdcEnabled}
                      onChange={(e) => setUsdcEnabled(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Automatic Payments"
                    secondary="Process payments automatically"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={autoPayments}
                      onChange={(e) => setAutoPayments(e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Payment Threshold ($)"
                    secondary="Minimum amount for auto-payments"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      type="number"
                      value={paymentThreshold}
                      onChange={(e) => setPaymentThreshold(e.target.value)}
                      size="small"
                      sx={{ width: 100 }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 