import { UserRole } from './auth';

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  rank: string;
  unit: string;
  branch: string;
  mos: string;
  dodId: string;
  role: UserRole;
  classification: string;
  permissions: string[];
  lastLogin: string;
  profileImage: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    notifications: {
      email: boolean;
      push: boolean;
      transferRequests: boolean;
      securityAlerts: boolean;
      systemUpdates: boolean;
      assetChanges: boolean;
    };
  };
}

export interface UserSettingsUpdate {
  email?: string;
  phoneNumber?: string;
  timezone?: string;
  dateFormat?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
    transferRequests?: boolean;
    securityAlerts?: boolean;
    systemUpdates?: boolean;
    assetChanges?: boolean;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    transferRequests: boolean;
    securityAlerts: boolean;
    systemUpdates: boolean;
    assetChanges: boolean;
  };
}
