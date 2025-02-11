import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Paper } from '@mui/material';
import { RootState } from '@/store/store';
import { useSettings } from '@/contexts/SettingsContext';
import { UserSettings } from './UserSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { NotificationSettings } from './NotificationSettings';
import { DataManagement } from './DataManagement';
import { UserProfile } from '../types/settings.types';
import type { User } from '@/types/auth';

export const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const settings = useSettings();

  const userProfile: UserProfile = {
    rank: user?.rank ?? '',
    fullName: user?.name ?? '',
    unit: user?.unit ?? '',
    dutyPosition: user?.dutyPosition ?? ''
  };

  const {
    darkMode,
    highContrast,
    fontSize,
    toggleDarkMode,
    toggleHighContrast,
    setFontSize,
    emailNotifications,
    pushNotifications,
    mobileSettings,
    toggleEmailNotification,
    togglePushNotification,
    toggleMobileSetting
  } = settings;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: 'rgba(0, 0, 0, 0.2)', 
            backgroundImage: 'none',
            boxShadow: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <UserSettings profile={userProfile} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: 'rgba(0, 0, 0, 0.2)', 
            backgroundImage: 'none',
            boxShadow: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <AppearanceSettings
              darkMode={darkMode}
              highContrast={highContrast}
              fontSize={fontSize}
              toggleDarkMode={toggleDarkMode}
              toggleHighContrast={toggleHighContrast}
              setFontSize={setFontSize}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: 'rgba(0, 0, 0, 0.2)', 
            backgroundImage: 'none',
            boxShadow: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <NotificationSettings
              emailNotifications={{
                enabled: true,
                ...emailNotifications
              }}
              pushNotifications={{
                enabled: true,
                ...pushNotifications
              }}
              mobileSettings={{
                enabled: true,
                ...mobileSettings
              }}
              toggleEmailNotification={toggleEmailNotification}
              togglePushNotification={togglePushNotification}
              toggleMobileSetting={toggleMobileSetting}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: 'rgba(0, 0, 0, 0.2)', 
            backgroundImage: 'none',
            boxShadow: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <DataManagement />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
