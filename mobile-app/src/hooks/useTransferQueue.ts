import { useState, useEffect, useCallback } from 'react';
import { QueueStorage } from '../offline/storage/queue_storage';
import { Operation } from '../database/local/models/operation';
import { useNetworkStatus } from './useNetworkStatus';
import { SyncManager } from '../offline/sync/sync_manager';

interface TransferQueue {
  pendingTransfers: Operation[];
  isProcessing: boolean;
  error: Error | null;
  enqueueTransfer: (transfer: Omit<Operation, 'id' | 'createdAt' | 'status' | 'retryCount'>) => Promise<void>;
  retryFailedTransfers: () => Promise<void>;
  clearError: () => void;
}

export const useTransferQueue = (pollingInterval = 5000): TransferQueue => {
  const [pendingTransfers, setPendingTransfers] = useState<Operation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isOffline } = useNetworkStatus();

  const loadPendingTransfers = useCallback(async () => {
    try {
      const transfers = await QueueStorage.getNextBatch();
      setPendingTransfers(transfers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load transfers'));
    }
  }, []);

  useEffect(() => {
    loadPendingTransfers();
    
    const interval = setInterval(() => {
      if (!isOffline && !isProcessing) {
        loadPendingTransfers();
      }
    }, pollingInterval);

    return () => {
      clearInterval(interval);
    };
  }, [isOffline, isProcessing, loadPendingTransfers, pollingInterval]);

  const enqueueTransfer = async (
    transfer: Omit<Operation, 'id' | 'createdAt' | 'status' | 'retryCount'>
  ) => {
    try {
      await QueueStorage.enqueue(transfer);
      await loadPendingTransfers();
      
      if (!isOffline) {
        const syncManager = SyncManager.getInstance();
        syncManager.startSync();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to enqueue transfer'));
    }
  };

  const retryFailedTransfers = async () => {
    try {
      setIsProcessing(true);
      const failedTransfers = pendingTransfers.filter(t => t.status === 'failed');
      
      for (const transfer of failedTransfers) {
        await QueueStorage.markAsProcessing(transfer.id);
      }
      
      await loadPendingTransfers();
      
      if (!isOffline) {
        const syncManager = SyncManager.getInstance();
        syncManager.startSync();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to retry transfers'));
    } finally {
      setIsProcessing(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    pendingTransfers,
    isProcessing,
    error,
    enqueueTransfer,
    retryFailedTransfers,
    clearError
  };
};
