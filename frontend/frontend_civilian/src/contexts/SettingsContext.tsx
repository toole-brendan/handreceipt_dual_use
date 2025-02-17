import React, { createContext, useContext, useState, useEffect } from 'react';

export interface GeneralSettings {
  companyName: string;
  address: string;
  timeZone: string;
  dateFormat: string;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  twoFactorAuth: boolean;
  sessionTimeout: number;
}

export interface ApiKey {
  key: string;
  permissions: 'read-only' | 'read-write' | 'admin';
  created: string;
}

export interface ConnectedApp {
  name: string;
  type: 'logistics' | 'erp';
  connected: boolean;
  lastSync?: string;
}

export interface IntegrationsSettings {
  apiKeys: ApiKey[];
  connectedApps: ConnectedApp[];
}

export interface NotificationSettings {
  emailNotifications: {
    lowStockAlerts: boolean;
    temperatureExcursionAlerts: boolean;
    shipmentDelayAlerts: boolean;
    transactionConfirmation: boolean;
  };
}

export interface BlockchainSettings {
  network: 'mainnet' | 'testnet';
  nodeUrl: string;
  inventoryContract: string;
  shipmentContract: string;
  keyManagement: {
    useHardwareWallet: boolean;
    useSoftwareWallet: boolean;
  };
}

export interface AppearanceSettings {
  darkMode: boolean;
  highContrast: boolean;
  fontSize: 'default' | 'large' | 'xlarge';
}

export interface Settings {
  general: GeneralSettings;
  security: SecuritySettings;
  integrations: IntegrationsSettings;
  notifications: NotificationSettings;
  blockchain: BlockchainSettings;
  appearance: AppearanceSettings;
}

interface SettingsContextType {
  settings: Settings;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  updateIntegrationsSettings: (settings: Partial<IntegrationsSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateBlockchainSettings: (settings: Partial<BlockchainSettings>) => void;
  updateAppearanceSettings: (settings: Partial<AppearanceSettings>) => void;
  generateApiKey: () => void;
  deleteApiKey: (key: string) => void;
  connectApp: (appName: string) => void;
  disconnectApp: (appName: string) => void;
}

const defaultSettings: Settings = {
  general: {
    companyName: '',
    address: '',
    timeZone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    twoFactorAuth: false,
    sessionTimeout: 30,
  },
  integrations: {
    apiKeys: [],
    connectedApps: [
      { name: 'FedEx', type: 'logistics', connected: false },
      { name: 'UPS', type: 'logistics', connected: false },
      { name: 'DHL', type: 'logistics', connected: false },
      { name: 'USPS', type: 'logistics', connected: false },
      { name: 'XPO Logistics', type: 'logistics', connected: false },
      { name: 'SAP S/4HANA', type: 'erp', connected: false },
      { name: 'Oracle Transportation Management', type: 'erp', connected: false },
      { name: 'Blue Yonder', type: 'erp', connected: false },
      { name: 'E2open', type: 'erp', connected: false },
      { name: 'Netsuite', type: 'erp', connected: false },
      { name: 'Microsoft Dynamics 365', type: 'erp', connected: false },
    ],
  },
  notifications: {
    emailNotifications: {
      lowStockAlerts: true,
      temperatureExcursionAlerts: true,
      shipmentDelayAlerts: false,
      transactionConfirmation: true,
    },
  },
  blockchain: {
    network: 'testnet',
    nodeUrl: '',
    inventoryContract: '',
    shipmentContract: '',
    keyManagement: {
      useHardwareWallet: false,
      useSoftwareWallet: false,
    },
  },
  appearance: {
    darkMode: true,
    highContrast: false,
    fontSize: 'default',
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return {
          ...defaultSettings,
          ...parsed,
        };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  const updateGeneralSettings = (newSettings: Partial<GeneralSettings>) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        ...newSettings,
      },
    }));
  };

  const updateSecuritySettings = (newSettings: Partial<SecuritySettings>) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        ...newSettings,
      },
    }));
  };

  const updateIntegrationsSettings = (newSettings: Partial<IntegrationsSettings>) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        ...newSettings,
      },
    }));
  };

  const updateNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        ...newSettings,
      },
    }));
  };

  const updateBlockchainSettings = (newSettings: Partial<BlockchainSettings>) => {
    setSettings(prev => ({
      ...prev,
      blockchain: {
        ...prev.blockchain,
        ...newSettings,
      },
    }));
  };

  const updateAppearanceSettings = (newSettings: Partial<AppearanceSettings>) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        ...newSettings,
      },
    }));
  };

  const generateApiKey = () => {
    const newKey: ApiKey = {
      key: Math.random().toString(36).substring(2) + Date.now().toString(36),
      permissions: 'read-only',
      created: new Date().toISOString(),
    };

    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        apiKeys: [...prev.integrations.apiKeys, newKey],
      },
    }));
  };

  const deleteApiKey = (keyToDelete: string) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        apiKeys: prev.integrations.apiKeys.filter(key => key.key !== keyToDelete),
      },
    }));
  };

  const connectApp = (appName: string) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        connectedApps: prev.integrations.connectedApps.map(app =>
          app.name === appName
            ? { ...app, connected: true, lastSync: new Date().toISOString() }
            : app
        ),
      },
    }));
  };

  const disconnectApp = (appName: string) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        connectedApps: prev.integrations.connectedApps.map(app =>
          app.name === appName ? { ...app, connected: false } : app
        ),
      },
    }));
  };

  const value: SettingsContextType = {
    settings,
    updateGeneralSettings,
    updateSecuritySettings,
    updateIntegrationsSettings,
    updateNotificationSettings,
    updateBlockchainSettings,
    updateAppearanceSettings,
    generateApiKey,
    deleteApiKey,
    connectApp,
    disconnectApp,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
