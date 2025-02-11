import { UserRole } from '@/types/auth';

export interface UserProfile {
  rank: string;
  fullName: string;
  unit: string;
  dutyPosition: string;
}

export interface User {
  id: string;
  rank?: string;
  name?: string;
  unit?: string;
  dutyPosition?: string;
  role: UserRole;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    transferRequests: boolean;
    sensitiveItems: boolean;
    maintenance: boolean;
  };
  push: {
    enabled: boolean;
    urgentAlerts: boolean;
    propertyUpdates: boolean;
  };
  mobile: {
    enabled: boolean;
    offlineMode: boolean;
    cameraAccess: boolean;
  };
}

export interface AppearanceSettings {
  darkMode: boolean;
  highContrast: boolean;
  fontSize: 'default' | 'large' | 'xlarge';
}

export interface SettingsState {
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  loading: boolean;
  error: string | null;
}

export type FontSize = 'default' | 'large' | 'xlarge';
