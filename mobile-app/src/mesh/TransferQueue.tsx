// mobile-app/src/mesh/TransferQueue.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTheme } from '@/hooks/useTheme';
import { TransferStatus, Transfer, TransferPriority } from '@/types/transfer';
import { encryptData, decryptData } from '@/utils/encryption';
import { generateChecksum } from '@/utils/crypto';
import { logger } from '@/utils/logger';

interface QueuedTransfer extends Transfer {
  queuedAt: number;
  retryCount: number;
  lastRetry?: number;
  checksum: string;
  priority: TransferPriority;
  error?: string;
}

interface QueueStats {
  totalItems: number;
  pendingItems: number;
  failedItems: number;
  lastSync: number | null;
}

export class TransferQueue {
  private readonly storageKey = 'secure_transfer_queue';
  private readonly maxQueueSize = 1000;
  private readonly maxRetries = 3;

  async addToQueue(transfer: Transfer): Promise<boolean> {
    try {
      const queue = await this.getQueue();
      
      // Check queue size limit
      if (queue.length >= this.maxQueueSize) {
        logger.warn('Transfer queue is full');
        return false;
      }

      // Check for duplicates
      const isDuplicate = queue.some(t => t.id === transfer.id);
      if (isDuplicate) {
        logger.warn(`Transfer ${transfer.id} already in queue`);
        return false;
      }

      const queuedTransfer: QueuedTransfer = {
        ...transfer,
        queuedAt: Date.now(),
        retryCount: 0,
        checksum: await generateChecksum(transfer),
        priority: this.determineTransferPriority(transfer),
      };

      // Add to queue and sort by priority
      queue.push(queuedTransfer);
      queue.sort((a, b) => b.priority - a.priority);

      // Encrypt and save
      await this.saveQueue(queue);
      await this.updateStats({ totalItems: queue.length });

      logger.info(`Transfer ${transfer.id} added to queue`);
      return true;

    } catch (error) {
      logger.error('Failed to add transfer to queue:', error);
      throw new Error('Failed to add transfer to queue');
    }
  }

  async getQueue(): Promise<QueuedTransfer[]> {
    try {
      const encryptedData = await AsyncStorage.getItem(this.storageKey);
      if (!encryptedData) return [];

      const decryptedData = await decryptData(encryptedData);
      const queue: QueuedTransfer[] = JSON.parse(decryptedData);

      // Validate queue integrity
      return queue.filter(transfer => {
        const isValid = this.validateTransfer(transfer);
        if (!isValid) {
          logger.warn(`Invalid transfer removed from queue: ${transfer.id}`);
        }
        return isValid;
      });

    } catch (error) {
      logger.error('Failed to retrieve queue:', error);
      return [];
    }
  }

  async removeFromQueue(transferId: string): Promise<boolean> {
    try {
      const queue = await this.getQueue();
      const initialLength = queue.length;
      
      const updatedQueue = queue.filter(t => t.id !== transferId);
      
      if (updatedQueue.length === initialLength) {
        return false;
      }

      await this.saveQueue(updatedQueue);
      await this.updateStats({ totalItems: updatedQueue.length });
      
      logger.info(`Transfer ${transferId} removed from queue`);
      return true;

    } catch (error) {
      logger.error(`Failed to remove transfer ${transferId}:`, error);
      return false;
    }
  }

  async updateTransferStatus(
    transferId: string,
    status: TransferStatus,
    error?: string
  ): Promise<boolean> {
    try {
      const queue = await this.getQueue();
      const transfer = queue.find(t => t.id === transferId);

      if (!transfer) return false;

      transfer.status = status;
      transfer.error = error;
      
      if (status === TransferStatus.Failed) {
        transfer.retryCount = (transfer.retryCount || 0) + 1;
        transfer.lastRetry = Date.now();
      }

      await this.saveQueue(queue);
      await this.updateStats({
        failedItems: queue.filter(t => t.status === TransferStatus.Failed).length
      });

      return true;

    } catch (error) {
      logger.error(`Failed to update transfer ${transferId} status:`, error);
      return false;
    }
  }

  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await this.updateStats({
        totalItems: 0,
        pendingItems: 0,
        failedItems: 0
      });
      logger.info('Transfer queue cleared');
    } catch (error) {
      logger.error('Failed to clear queue:', error);
      throw new Error('Failed to clear queue');
    }
  }

  async getStats(): Promise<QueueStats> {
    try {
      const statsJson = await AsyncStorage.getItem('queue_stats');
      return statsJson ? JSON.parse(statsJson) : {
        totalItems: 0,
        pendingItems: 0,
        failedItems: 0,
        lastSync: null
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      throw new Error('Failed to get queue stats');
    }
  }

  private async saveQueue(queue: QueuedTransfer[]): Promise<void> {
    try {
      const encryptedData = await encryptData(JSON.stringify(queue));
      await AsyncStorage.setItem(this.storageKey, encryptedData);
    } catch (error) {
      logger.error('Failed to save queue:', error);
      throw new Error('Failed to save queue');
    }
  }

  private async updateStats(updates: Partial<QueueStats>): Promise<void> {
    try {
      const currentStats = await this.getStats();
      const newStats = { ...currentStats, ...updates };
      await AsyncStorage.setItem('queue_stats', JSON.stringify(newStats));
    } catch (error) {
      logger.error('Failed to update queue stats:', error);
    }
  }

  private determineTransferPriority(transfer: Transfer): TransferPriority {
    switch (transfer.classification) {
      case 'TOP_SECRET':
        return TransferPriority.High;
      case 'SECRET':
        return TransferPriority.High;
      case 'CONFIDENTIAL':
        return TransferPriority.Medium;
      default:
        return TransferPriority.Low;
    }
  }

  private validateTransfer(transfer: QueuedTransfer): boolean {
    return (
      !!transfer.id &&
      !!transfer.queuedAt &&
      typeof transfer.retryCount === 'number' &&
      transfer.retryCount <= this.maxRetries &&
      !!transfer.checksum &&
      generateChecksum(transfer).then(checksum => checksum === transfer.checksum)
    );
  }

  async cleanup(): Promise<void> {
    try {
      const queue = await this.getQueue();
      
      // Remove completed transfers older than 7 days
      const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const updatedQueue = queue.filter(transfer => {
        if (transfer.status === TransferStatus.Completed) {
          return transfer.queuedAt > cutoff;
        }
        return true;
      });

      // Remove failed transfers that exceeded retry limit
      const finalQueue = updatedQueue.filter(transfer => 
        transfer.status !== TransferStatus.Failed || 
        transfer.retryCount < this.maxRetries
      );

      if (finalQueue.length !== queue.length) {
        await this.saveQueue(finalQueue);
        await this.updateStats({ totalItems: finalQueue.length });
        logger.info(`Cleaned up ${queue.length - finalQueue.length} transfers`);
      }

    } catch (error) {
      logger.error('Failed to cleanup queue:', error);
      throw new Error('Failed to cleanup queue');
    }
  }
}

export default new TransferQueue();