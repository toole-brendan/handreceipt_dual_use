export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'degraded' | 'critical';
  threshold: number;
  history: Array<{ timestamp: Date; value: number }>;
}

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  classificationLevel: string;
  isAuthenticated: boolean;
}

export interface NotificationState {
  unread: number;
  notifications: Array<any>; // Add proper notification type
}

export interface RootState {
  auth: AuthState;
  notifications: NotificationState;
  mfa: any; // Add proper MFA state type
} 