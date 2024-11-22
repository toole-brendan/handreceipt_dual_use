import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences } from '@/types/user';

interface SettingsContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      transferRequests: true,
      securityAlerts: true,
      systemUpdates: true,
      assetChanges: true,
    },
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/v1/user/preferences');
      const data = await response.json();
      if (data.success) {
        setPreferences(data.data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const response = await fetch('/api/v1/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });
      
      if (response.ok) {
        setPreferences(prev => ({ ...prev, ...newPreferences }));
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 