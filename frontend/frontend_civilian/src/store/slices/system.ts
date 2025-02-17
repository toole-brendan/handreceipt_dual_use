import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SystemHealth {
  network: 'healthy' | 'degraded' | 'down';
  blockchain: 'synced' | 'syncing' | 'error';
  security: 'normal' | 'elevated' | 'critical';
  performance: number; // 0-100
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
  source: string;
}

interface SystemState {
  health: SystemHealth;
  alerts: SystemAlert[];
  lastSyncTimestamp: string | null;
  maintenanceMode: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: SystemState = {
  health: {
    network: 'healthy',
    blockchain: 'synced',
    security: 'normal',
    performance: 100,
  },
  alerts: [],
  lastSyncTimestamp: null,
  maintenanceMode: false,
  loading: false,
  error: null,
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    updateHealth: (state, action: PayloadAction<Partial<SystemHealth>>) => {
      state.health = { ...state.health, ...action.payload };
    },
    addAlert: (state, action: PayloadAction<Omit<SystemAlert, 'id' | 'timestamp' | 'read'>>) => {
      state.alerts.unshift({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      });
    },
    markAlertAsRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.read = true;
      }
    },
    markAllAlertsAsRead: (state) => {
      state.alerts.forEach(alert => {
        alert.read = true;
      });
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
    updateLastSyncTimestamp: (state) => {
      state.lastSyncTimestamp = new Date().toISOString();
    },
    setMaintenanceMode: (state, action: PayloadAction<boolean>) => {
      state.maintenanceMode = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetState: () => initialState,
  },
});

export const {
  updateHealth,
  addAlert,
  markAlertAsRead,
  markAllAlertsAsRead,
  clearAlerts,
  updateLastSyncTimestamp,
  setMaintenanceMode,
  setLoading,
  setError,
  resetState,
} = systemSlice.actions;

export const systemReducer = systemSlice.reducer;
