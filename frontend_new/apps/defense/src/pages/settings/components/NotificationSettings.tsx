import { FC, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  SelectChangeEvent,
} from '@mui/material';

interface NotificationPreference {
  enabled: boolean;
  deliveryMethod: 'email' | 'in-app' | 'both' | 'none';
}

interface NotificationSettings {
  transferRequests: NotificationPreference;
  maintenanceReminders: NotificationPreference;
  userActivity: NotificationPreference;
  securityAlerts: NotificationPreference;
  inventoryUpdates: NotificationPreference;
}

export const NotificationSettings: FC = () => {
  const [preferences, setPreferences] = useState<NotificationSettings>({
    transferRequests: { enabled: true, deliveryMethod: 'both' },
    maintenanceReminders: { enabled: true, deliveryMethod: 'email' },
    userActivity: { enabled: true, deliveryMethod: 'in-app' },
    securityAlerts: { enabled: true, deliveryMethod: 'both' },
    inventoryUpdates: { enabled: true, deliveryMethod: 'in-app' },
  });

  const handleToggleChange = (key: keyof NotificationSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: event.target.checked,
      },
    }));
  };

  const handleDeliveryMethodChange = (key: keyof NotificationSettings) => (
    event: SelectChangeEvent
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        deliveryMethod: event.target.value as NotificationPreference['deliveryMethod'],
      },
    }));
  };

  const handleSavePreferences = async () => {
    try {
      // TODO: Implement save preferences with blockchain
      console.log('Saving notification preferences:', preferences);
      // Show success message
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Show error message
    }
  };

  const renderNotificationItem = (
    key: keyof NotificationSettings,
    label: string,
    description: string
  ) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="subtitle1">{label}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <Switch
          checked={preferences[key].enabled}
          onChange={handleToggleChange(key)}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#4A5D23',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#4A5D23',
            },
          }}
        />
      </Box>
      {preferences[key].enabled && (
        <FormControl size="small" fullWidth>
          <InputLabel>Delivery Method</InputLabel>
          <Select
            value={preferences[key].deliveryMethod}
            label="Delivery Method"
            onChange={handleDeliveryMethodChange(key)}
          >
            <MenuItem value="email">Email Only</MenuItem>
            <MenuItem value="in-app">In-App Only</MenuItem>
            <MenuItem value="both">Both Email & In-App</MenuItem>
            <MenuItem value="none">None</MenuItem>
          </Select>
        </FormControl>
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#4A5D23', fontWeight: 'bold', mb: 2 }}>
        Notification Preferences
      </Typography>
      <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>
        Customize how you receive updates and alerts.
      </Typography>

      <Card>
        <CardContent>
          {renderNotificationItem(
            'transferRequests',
            'Transfer Requests',
            'Notifications for property transfer requests and approvals'
          )}
          {renderNotificationItem(
            'maintenanceReminders',
            'Maintenance Reminders',
            'Alerts for scheduled maintenance and inspections'
          )}
          {renderNotificationItem(
            'userActivity',
            'User Activity',
            'Updates about user actions and system changes'
          )}
          {renderNotificationItem(
            'securityAlerts',
            'Security Alerts',
            'Critical security notifications and warnings'
          )}
          {renderNotificationItem(
            'inventoryUpdates',
            'Inventory Updates',
            'Notifications about inventory changes and status updates'
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSavePreferences}
              sx={{
                backgroundColor: '#4A5D23',
                '&:hover': { backgroundColor: '#3A4D13' },
              }}
            >
              Save Preferences
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}; 