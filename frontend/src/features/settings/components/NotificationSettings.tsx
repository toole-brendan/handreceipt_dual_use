import React from 'react';
import { Box, Switch, FormControlLabel, Typography } from '@mui/material';

export interface NotificationSettingsProps {
  emailNotifications: {
    enabled: boolean;
    transferRequests: boolean;
    sensitiveItems: boolean;
    maintenance: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    urgentAlerts: boolean;
    propertyUpdates: boolean;
  };
  mobileSettings: {
    enabled: boolean;
    offlineMode: boolean;
    cameraAccess: boolean;
  };
  toggleEmailNotification: (type: 'transferRequests' | 'sensitiveItems' | 'maintenance') => void;
  togglePushNotification: (type: 'urgentAlerts' | 'propertyUpdates') => void;
  toggleMobileSetting: (type: 'offlineMode' | 'cameraAccess') => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  emailNotifications,
  pushNotifications,
  mobileSettings,
  toggleEmailNotification,
  togglePushNotification,
  toggleMobileSetting,
}) => {
  return (
    <Box>
      <Typography variant="h6">Email Notifications</Typography>
      <FormControlLabel
        control={<Switch checked={emailNotifications.enabled} />}
        label="Enable Email Notifications"
      />
      {emailNotifications.enabled && (
        <>
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications.transferRequests}
                onChange={() => toggleEmailNotification('transferRequests')}
              />
            }
            label="Transfer Requests"
          />
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications.sensitiveItems}
                onChange={() => toggleEmailNotification('sensitiveItems')}
              />
            }
            label="Sensitive Items"
          />
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications.maintenance}
                onChange={() => toggleEmailNotification('maintenance')}
              />
            }
            label="Maintenance Updates"
          />
        </>
      )}

      <Typography variant="h6" sx={{ mt: 3 }}>Push Notifications</Typography>
      <FormControlLabel
        control={<Switch checked={pushNotifications.enabled} />}
        label="Enable Push Notifications"
      />
      {pushNotifications.enabled && (
        <>
          <FormControlLabel
            control={
              <Switch
                checked={pushNotifications.urgentAlerts}
                onChange={() => togglePushNotification('urgentAlerts')}
              />
            }
            label="Urgent Alerts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={pushNotifications.propertyUpdates}
                onChange={() => togglePushNotification('propertyUpdates')}
              />
            }
            label="Property Updates"
          />
        </>
      )}

      <Typography variant="h6" sx={{ mt: 3 }}>Mobile Settings</Typography>
      <FormControlLabel
        control={<Switch checked={mobileSettings.enabled} />}
        label="Enable Mobile Features"
      />
      {mobileSettings.enabled && (
        <>
          <FormControlLabel
            control={
              <Switch
                checked={mobileSettings.offlineMode}
                onChange={() => toggleMobileSetting('offlineMode')}
              />
            }
            label="Offline Mode"
          />
          <FormControlLabel
            control={
              <Switch
                checked={mobileSettings.cameraAccess}
                onChange={() => toggleMobileSetting('cameraAccess')}
              />
            }
            label="Camera Access"
          />
        </>
      )}
    </Box>
  );
};

export default NotificationSettings;
