export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: UserNotificationPreferences;
  language: string;
  timezone: string;
}

export interface UserNotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  alerts: {
    security: boolean;
    system: boolean;
    property: boolean;
    personnel: boolean;
  };
}

export interface BaseAuthState {
  user: BaseUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface BaseAuthResponse {
  user: BaseUser;
  token: string;
}

export interface BaseAuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
