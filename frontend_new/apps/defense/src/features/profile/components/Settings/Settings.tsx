import React, { useState } from 'react';
import { Box } from '@mui/material';
import { UserProfile } from '@/types/user';
import { AppearanceSettings, NotificationSettings, SecuritySettings } from '../../../../features/settings/components';

interface SettingsProps {
  profile: UserProfile;
}

export const Settings: React.FC<SettingsProps> = ({ profile }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'default' | 'large' | 'xlarge'>('default');

  const [emailNotifications, setEmailNotifications] = useState({
    enabled: true,
    transferRequests: true,
    sensitiveItems: true,
    maintenance: true,
  });

  const [pushNotifications, setPushNotifications] = useState({
    enabled: true,
    urgentAlerts: true,
    propertyUpdates: true,
  });

  const [mobileSettings, setMobileSettings] = useState({
    enabled: true,
    offlineMode: false,
    cameraAccess: true,
  });

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);

  const toggleEmailNotification = (type: 'transferRequests' | 'sensitiveItems' | 'maintenance') => {
    setEmailNotifications(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const togglePushNotification = (type: 'urgentAlerts' | 'propertyUpdates') => {
    setPushNotifications(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const toggleMobileSetting = (type: 'offlineMode' | 'cameraAccess') => {
    setMobileSettings(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <Box>
      <AppearanceSettings
        darkMode={darkMode}
        highContrast={highContrast}
        fontSize={fontSize}
        toggleDarkMode={toggleDarkMode}
        toggleHighContrast={toggleHighContrast}
        setFontSize={setFontSize}
      />
      <NotificationSettings
        emailNotifications={emailNotifications}
        pushNotifications={pushNotifications}
        mobileSettings={mobileSettings}
        toggleEmailNotification={toggleEmailNotification}
        togglePushNotification={togglePushNotification}
        toggleMobileSetting={toggleMobileSetting}
      />
      <SecuritySettings profile={profile} />
    </Box>
  );
};

export default Settings;
