import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
} from '@mui/material';
import type { NotificationSettings as NotificationSettingsType } from '@/contexts/SettingsContext';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onUpdate: (settings: Partial<NotificationSettingsType>) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const handleEmailNotificationChange = (key: keyof NotificationSettingsType['emailNotifications']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({
      emailNotifications: {
        ...settings.emailNotifications,
        [key]: event.target.checked,
      },
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Email Notifications
      </Typography>
      <Paper sx={{ 
        p: 3, 
        bgcolor: 'rgba(0, 0, 0, 0.2)', 
        backgroundImage: 'none',
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications.lowStockAlerts}
                onChange={handleEmailNotificationChange('lowStockAlerts')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Low Stock Alerts</Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive notifications when inventory items are running low
                </Typography>
              </Box>
            }
          />
          <Divider sx={{ my: 1 }} />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications.temperatureExcursionAlerts}
                onChange={handleEmailNotificationChange('temperatureExcursionAlerts')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Temperature Excursion Alerts</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get notified when temperature-sensitive items exceed their safe range
                </Typography>
              </Box>
            }
          />
          <Divider sx={{ my: 1 }} />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications.shipmentDelayAlerts}
                onChange={handleEmailNotificationChange('shipmentDelayAlerts')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Shipment Delay Alerts</Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive updates about delayed or disrupted shipments
                </Typography>
              </Box>
            }
          />
          <Divider sx={{ my: 1 }} />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications.transactionConfirmation}
                onChange={handleEmailNotificationChange('transactionConfirmation')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Transaction Confirmations</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get notified when blockchain transactions are confirmed
                </Typography>
              </Box>
            }
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default NotificationSettings;
