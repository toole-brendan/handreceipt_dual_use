import { Platform } from 'react-native';

export const MESH_CONFIG = {
  // Network settings
  BLUETOOTH: {
    SERVICE_UUID: '00001234-0000-1000-8000-00805F9B34FB',
    CHARACTERISTIC_UUID: '00001235-0000-1000-8000-00805F9B34FB',
    SCAN_TIMEOUT: 10000, // 10 seconds
    MAX_RETRY_ATTEMPTS: 3,
    CONNECTION_TIMEOUT: 5000, // 5 seconds
  },

  WIFI_DIRECT: {
    GROUP_OWNER_INTENT: 0,
    CHANNEL: 11,
    PASSPHRASE: 'SecureAssetTransfer2024',
    DISCOVERY_TIMEOUT: 30000, // 30 seconds
    PORT: 8888,
  },

  // Sync settings
  SYNC: {
    AUTO_SYNC_INTERVAL: 300000, // 5 minutes
    BATCH_SIZE: 50,
    MAX_QUEUE_SIZE: 1000,
    MIN_BATTERY_LEVEL: 20, // Minimum battery level for sync
    RETRY_DELAYS: [1000, 5000, 15000], // Exponential backoff delays
  },

  // Security settings
  SECURITY: {
    ENCRYPTION_ALGORITHM: 'AES-256-GCM',
    KEY_SIZE: 256,
    MIN_SIGNAL_STRENGTH: -80, // Minimum RSSI for secure connection
    TIMEOUT: 30000, // 30 seconds timeout for security operations
  },

  // Platform specific settings
  ...Platform.select({
    ios: {
      PERMISSIONS: [
        'bluetooth-peripheral',
        'bluetooth-central',
        'local-network',
      ],
      BLE_MTU: 185,
    },
    android: {
      PERMISSIONS: [
        'android.permission.BLUETOOTH',
        'android.permission.BLUETOOTH_ADMIN',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_WIFI_STATE',
        'android.permission.CHANGE_WIFI_STATE',
      ],
      BLE_MTU: 512,
    },
  }),

  // Debug settings
  DEBUG: {
    ENABLED: __DEV__,
    LOG_LEVEL: 'debug',
    SIMULATE_OFFLINE: false,
    SIMULATE_LATENCY: 0,
  },
};

export const MESH_EVENTS = {
  PEER_DISCOVERED: 'PEER_DISCOVERED',
  PEER_LOST: 'PEER_LOST',
  SYNC_STARTED: 'SYNC_STARTED',
  SYNC_COMPLETED: 'SYNC_COMPLETED',
  SYNC_FAILED: 'SYNC_FAILED',
  TRANSFER_QUEUED: 'TRANSFER_QUEUED',
  TRANSFER_STARTED: 'TRANSFER_STARTED',
  TRANSFER_COMPLETED: 'TRANSFER_COMPLETED',
  TRANSFER_FAILED: 'TRANSFER_FAILED',
  CONNECTION_STATE_CHANGED: 'CONNECTION_STATE_CHANGED',
};

export const MESH_ERRORS = {
  BLUETOOTH_UNAVAILABLE: 'BLUETOOTH_UNAVAILABLE',
  WIFI_DIRECT_UNAVAILABLE: 'WIFI_DIRECT_UNAVAILABLE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  SYNC_ERROR: 'SYNC_ERROR',
  SECURITY_ERROR: 'SECURITY_ERROR',
  QUEUE_FULL: 'QUEUE_FULL',
  INVALID_PEER: 'INVALID_PEER',
  TIMEOUT: 'TIMEOUT',
};

export default MESH_CONFIG;
