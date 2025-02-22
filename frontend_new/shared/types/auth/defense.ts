import { BaseUser, BaseAuthState, BaseAuthResponse, BaseAuthError, UserNotificationPreferences } from './base';

export interface DefenseUserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: UserNotificationPreferences;
  language: string;
  timezone: string;
  // Defense-specific preferences
  securityClassification: 'show' | 'hide';
  missionView: 'tactical' | 'strategic';
  propertyTrackingMode: 'standard' | 'enhanced';
  autoLockTimeout: number; // minutes
  biometricAuth: boolean;
}

export interface DefenseUser extends Omit<BaseUser, 'preferences'> {
  // Defense-specific fields
  rank: string;
  branch: 'army' | 'navy' | 'air_force' | 'marines' | 'coast_guard' | 'space_force';
  unit: string;
  dutyStation: string;
  serviceId: string;
  securityClearance: 'confidential' | 'secret' | 'top_secret' | 'sci';
  specializations: string[];
  commanderId?: string;
  preferences: DefenseUserPreferences;
}

export interface DefenseAuthState extends Omit<BaseAuthState, 'user'> {
  user: DefenseUser | null;
}

export interface DefenseAuthResponse extends Omit<BaseAuthResponse, 'user'> {
  user: DefenseUser;
}

export interface DefenseAuthError extends BaseAuthError {
  unitId?: string;
  clearanceLevel?: string;
}
