import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { useSettings } from '@/contexts/SettingsContext';
import {
  GeneralSettings,
  SecuritySettings,
  IntegrationsSettings,
  NotificationSettings,
  BlockchainSettings,
  AppearanceSettings,
} from '.';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
};

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { settings, updateGeneralSettings, updateSecuritySettings, updateIntegrationsSettings, 
    updateNotificationSettings, updateBlockchainSettings, updateAppearanceSettings,
    generateApiKey, deleteApiKey, connectApp, disconnectApp } = useSettings();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="settings tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="General" {...a11yProps(0)} />
          <Tab label="Security" {...a11yProps(1)} />
          <Tab label="Integrations" {...a11yProps(2)} />
          <Tab label="Notifications" {...a11yProps(3)} />
          <Tab label="Blockchain" {...a11yProps(4)} />
          <Tab label="Appearance" {...a11yProps(5)} />
        </Tabs>
      </Box>

      <Paper sx={{ 
        p: 3, 
        bgcolor: 'rgba(0, 0, 0, 0.2)', 
        backgroundImage: 'none',
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <TabPanel value={activeTab} index={0}>
          <GeneralSettings
            settings={settings.general}
            onUpdate={updateGeneralSettings}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <SecuritySettings
            settings={settings.security}
            onUpdate={updateSecuritySettings}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <IntegrationsSettings
            settings={settings.integrations}
            onUpdate={updateIntegrationsSettings}
            onGenerateApiKey={generateApiKey}
            onDeleteApiKey={deleteApiKey}
            onConnectApp={connectApp}
            onDisconnectApp={disconnectApp}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <NotificationSettings
            settings={settings.notifications}
            onUpdate={updateNotificationSettings}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <BlockchainSettings
            settings={settings.blockchain}
            onUpdate={updateBlockchainSettings}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <AppearanceSettings
            settings={settings.appearance}
            onUpdate={updateAppearanceSettings}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Settings;
