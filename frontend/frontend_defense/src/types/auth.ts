export type UserRole = 'ADMIN' | 'COMMANDER' | 'SOLDIER' | 'SUPPLY' | 'MAINTENANCE' | 'OFFICER';

export interface User {
  id: string;
  rank?: string;
  name?: string;
  email: string;
  role: UserRole;
  unit?: string;
  dutyPosition?: string;
  classification: string;
  permissions: string[];
  lastLogin?: string;
  preferences?: {
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
