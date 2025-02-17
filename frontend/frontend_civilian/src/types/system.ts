import { LoadingState } from './common';

export interface SystemState {
  loading: LoadingState;
  error: string | null;
  maintenance: MaintenanceState;
  metrics: SystemMetrics;
  notifications: SystemNotifications;
  updates: SystemUpdates;
}

export interface MaintenanceState {
  isInMaintenance: boolean;
  scheduledMaintenance?: {
    startTime: string;
    endTime: string;
    reason: string;
  };
}

export interface SystemMetrics {
  uptime: number;
  activeUsers: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  networkLatency: number;
  requestsPerMinute: number;
  errorRate: number;
  lastUpdated: string;
}

export interface SystemNotification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  action?: {
    label: string;
    handler: string;
  };
}

export interface SystemNotifications {
  items: SystemNotification[];
  unreadCount: number;
}

export interface SystemUpdate {
  id: string;
  version: string;
  releaseDate: string;
  installed: boolean;
  mandatory: boolean;
  description: string;
  changes: {
    features: string[];
    fixes: string[];
    security: string[];
  };
}

export interface SystemUpdates {
  available: SystemUpdate[];
  lastChecked: string;
  autoUpdate: boolean;
}

export interface SystemConfig {
  theme: {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
  security: {
    mfaEnabled: boolean;
    sessionTimeout: number;
    passwordExpiration: number;
  };
  performance: {
    cacheEnabled: boolean;
    compressionEnabled: boolean;
    analyticsEnabled: boolean;
  };
}

export interface SystemStatus {
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  message?: string;
  lastUpdated: string;
  components: {
    [key: string]: {
      status: 'operational' | 'degraded' | 'maintenance' | 'outage';
      message?: string;
    };
  };
}
