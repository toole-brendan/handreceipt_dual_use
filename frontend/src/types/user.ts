export interface UserProfile {
  id: string;
  username: string;
  email: string;
  rank: string;
  unit: string;
  role: string;
  permissions: string[];
  lastLogin: string;
  profileImage?: string;
  phoneNumber?: string;
  classification: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  language: string;
  timezone: string;
  dateFormat: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  transferRequests: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
  assetChanges: boolean;
}

export interface UserSettingsUpdate {
  email?: string;
  phoneNumber?: string;
  preferences?: Partial<UserPreferences>;
} 