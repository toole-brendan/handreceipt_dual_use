import { BaseUser, BaseAuthState, BaseAuthResponse, BaseAuthError, UserNotificationPreferences } from './base';

export interface CivilianUserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: UserNotificationPreferences;
  language: string;
  timezone: string;
  // Civilian-specific preferences
  dashboardLayout: 'grid' | 'list';
  defaultLocationView: 'map' | 'list';
  inventoryDisplayMode: 'detailed' | 'compact';
  reportsAutoExport: boolean;
}

export interface CivilianUser extends Omit<BaseUser, 'preferences'> {
  // Civilian-specific fields
  organization: string;
  department?: string;
  employeeId: string;
  clearanceLevel: 'basic' | 'elevated' | 'admin';
  certifications: string[];
  supervisorId?: string;
  preferences: CivilianUserPreferences;
}

export interface CivilianAuthState extends Omit<BaseAuthState, 'user'> {
  user: CivilianUser | null;
}

export interface CivilianAuthResponse extends Omit<BaseAuthResponse, 'user'> {
  user: CivilianUser;
}

export interface CivilianAuthError extends BaseAuthError {
  organizationId?: string;
}
