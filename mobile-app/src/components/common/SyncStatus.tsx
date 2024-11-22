import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ConnectionType } from '@/types/network';
import { Icon } from '@/components/common/Icon';
import { useTheme } from '@/hooks/useTheme';

interface SyncStatusProps {
  isOnline: boolean;
  connectionType: ConnectionType;
  signalStrength: number;
  lastSync: Date | null;
  pendingTransfers: number;
  failedTransfers: number;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  isOnline,
  connectionType,
  signalStrength,
  lastSync,
  pendingTransfers,
  failedTransfers,
}) => {
  const { colors } = useTheme();

  const getConnectionIcon = () => {
    if (!isOnline) return 'wifi-off';
    
    switch (connectionType) {
      case ConnectionType.Wifi:
        return signalStrength > 70 ? 'wifi' : 'wifi-weak';
      case ConnectionType.Cellular:
        return signalStrength > 70 ? 'signal' : 'signal-weak';
      case ConnectionType.Bluetooth:
        return 'bluetooth';
      default:
        return 'question';
    }
  };

  const getConnectionLabel = () => {
    if (!isOnline) return 'Offline';
    
    const strength = signalStrength > 70 ? 'Strong' : 'Weak';
    switch (connectionType) {
      case ConnectionType.Wifi:
        return `WiFi (${strength})`;
      case ConnectionType.Cellular:
        return `Cellular (${strength})`;
      case ConnectionType.Bluetooth:
        return `Bluetooth (${strength})`;
      default:
        return 'Unknown Connection';
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    if (!isOnline) return colors.error;
    if (failedTransfers > 0) return colors.warning;
    if (pendingTransfers > 0) return colors.info;
    return colors.success;
  };

  return (
    <View style={[styles.container, { borderColor: getStatusColor() }]}>
      <View style={styles.row}>
        <View style={styles.connectionInfo}>
          <Icon 
            name={getConnectionIcon()} 
            size={20} 
            color={getStatusColor()}
            style={styles.icon}
          />
          <Text style={[styles.text, { color: getStatusColor() }]}>
            {getConnectionLabel()}
          </Text>
        </View>

        <View style={styles.syncInfo}>
          <Text style={styles.label}>Last Sync:</Text>
          <Text style={styles.text}>{formatLastSync(lastSync)}</Text>
        </View>
      </View>

      {(pendingTransfers > 0 || failedTransfers > 0) && (
        <View style={styles.transferInfo}>
          {pendingTransfers > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingTransfers} pending
              </Text>
            </View>
          )}
          {failedTransfers > 0 && (
            <View style={[styles.badge, styles.errorBadge]}>
              <Text style={styles.badgeText}>
                {failedTransfers} failed
              </Text>
            </View>
          )}
        </View>
      )}

      {!isOnline && (
        <Text style={styles.offlineMessage}>
          Updates will be synced when connection is restored
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  transferInfo: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  errorBadge: {
    backgroundColor: '#ffebee',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
  },
  offlineMessage: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default SyncStatus; 