export type UserRole = 'ADMIN' | 'COMMANDER' | 'SOLDIER' | 'SUPPLY' | 'MAINTENANCE' | 'OFFICER';
export type AppVersion = 'Defense' | 'Civilian';

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
  token: string | null;
  version: AppVersion;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  version: AppVersion;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setVersion: (version: AppVersion) => void;
}
