// mobile-app/src/mesh/OfflineSync.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTransferQueue } from '@/hooks/useTransferQueue';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SyncStatus } from '@/components/common/SyncStatus';
import { useTheme } from '@/hooks/useTheme';
import { syncWithBackend } from '@/services/sync';
import { Transfer, TransferStatus } from '@/types/transfer';

interface SyncState {
  lastSync: Date | null;
  syncInProgress: boolean;
  pendingTransfers: number;
  failedTransfers: number;
  lastError: string | null;
}

export const OfflineSync: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    lastSync: null,
    syncInProgress: false,
    pendingTransfers: 0,
    failedTransfers: 0,
    lastError: null,
  });

  const { getQueue, clearQueue, addToQueue } = useTransferQueue();
  const { isOnline, connectionType, signalStrength } = useNetworkStatus();
  const { colors } = useTheme();

  const processTransferQueue = useCallback(async () => {
    if (syncState.syncInProgress || !isOnline) return;

    try {
      setSyncState(prev => ({ ...prev, syncInProgress: true }));
      const transfers = await getQueue();

      if (transfers.length === 0) {
        setSyncState(prev => ({
          ...prev,
          syncInProgress: false,
          lastSync: new Date(),
        }));
        return;
      }

      // Group transfers by priority
      const prioritizedTransfers = transfers.sort((a, b) => b.priority - a.priority);
      let successCount = 0;
      let failCount = 0;

      for (const transfer of prioritizedTransfers) {
        try {
          const result = await syncWithBackend(transfer);
          if (result.success) {
            successCount++;
          } else {
            failCount++;
            console.warn(`Failed to sync transfer ${transfer.id}: ${result.error}`);
          }
          
          // Add delay between transfers to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          failCount++;
          console.error('Transfer sync error:', error);
        }
      }

      // Update queue after sync
      const remainingTransfers = transfers.filter(t => t.status !== TransferStatus.Completed);
      await clearQueue();
      for (const transfer of remainingTransfers) {
        await addToQueue(transfer);
      }

      setSyncState(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date(),
        pendingTransfers: remainingTransfers.length,
        failedTransfers: failCount,
        lastError: failCount > 0 ? `Failed to sync ${failCount} transfers` : null,
      }));

    } catch (error) {
      console.error('Queue processing error:', error);
      setSyncState(prev => ({
        ...prev,
        syncInProgress: false,
        lastError: error.message,
      }));
    }
  }, [isOnline, getQueue, clearQueue, addToQueue]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        processTransferQueue();
      }
    });

    return () => unsubscribe();
  }, [processTransferQueue]);

  const handleManualSync = () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Cannot sync while offline. Please check your connection.'
      );
      return;
    }

    processTransferQueue();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sync Status</Text>
        <TouchableOpacity
          style={[
            styles.syncButton,
            (!isOnline || syncState.syncInProgress) && styles.buttonDisabled
          ]}
          onPress={handleManualSync}
          disabled={!isOnline || syncState.syncInProgress}
        >
          <Text style={styles.buttonText}>
            {syncState.syncInProgress ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>

      <SyncStatus
        isOnline={isOnline}
        connectionType={connectionType}
        signalStrength={signalStrength}
        lastSync={syncState.lastSync}
        pendingTransfers={syncState.pendingTransfers}
        failedTransfers={syncState.failedTransfers}
      />

      {syncState.syncInProgress && <LoadingSpinner />}

      {syncState.lastError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{syncState.lastError}</Text>
          <TouchableOpacity
            onPress={() => setSyncState(prev => ({ ...prev, lastError: null }))}
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  errorText: {
    color: '#c62828',
    marginBottom: 8,
  },
  dismissText: {
    color: '#2196f3',
    textAlign: 'right',
  },
});

export default OfflineSync;