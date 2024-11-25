import { useState, useCallback, useEffect } from 'react';
import SQLite from 'react-native-sqlite-storage';
import { ScanResult } from '../types/scanner';
import { Transfer, SyncStatus } from '../types/sync';
import { HandReceiptMobile } from '../native/HandReceiptMobile';

const db = SQLite.openDatabase(
    { name: 'handreceipt.db', location: 'default' },
    () => console.log('Database opened'),
    error => console.error('Database error:', error)
);

export const useTransferQueue = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize database
    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS transfers (
                    id TEXT PRIMARY KEY,
                    propertyId TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    scanData TEXT NOT NULL,
                    status TEXT NOT NULL,
                    retryCount INTEGER DEFAULT 0,
                    error TEXT
                )`,
                [],
                () => loadTransfers(),
                (_, error) => {
                    console.error('Database initialization error:', error);
                    return false;
                }
            );
        });

        // Set up sync status listener
        const subscription = HandReceiptMobile.addSyncStatusListener(({ id, status }) => {
            updateTransferStatus(id, status);
        });

        return () => subscription.remove();
    }, []);

    // Load transfers from SQLite
    const loadTransfers = useCallback(() => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM transfers ORDER BY timestamp DESC',
                [],
                (_, { rows }) => {
                    const loadedTransfers = rows.raw().map(row => ({
                        ...row,
                        scanData: JSON.parse(row.scanData)
                    }));
                    setTransfers(loadedTransfers);
                    setIsLoading(false);
                }
            );
        });
    }, []);

    // Add new transfer
    const addTransfer = useCallback(async (transfer: Transfer) => {
        return new Promise<void>((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `INSERT INTO transfers (id, propertyId, timestamp, scanData, status, retryCount)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        transfer.id,
                        transfer.propertyId,
                        transfer.timestamp,
                        JSON.stringify(transfer.scanData),
                        transfer.status,
                        transfer.retryCount
                    ],
                    () => {
                        setTransfers(prev => [...prev, transfer]);
                        resolve();
                    },
                    (_, error) => {
                        reject(error);
                        return false;
                    }
                );
            });
        });
    }, []);

    // Update transfer status
    const updateTransferStatus = useCallback((id: string, status: SyncStatus, error?: string) => {
        db.transaction(tx => {
            tx.executeSql(
                `UPDATE transfers 
                 SET status = ?, error = ?, retryCount = retryCount + 1
                 WHERE id = ?`,
                [status, error, id],
                () => {
                    setTransfers(prev =>
                        prev.map(t =>
                            t.id === id
                                ? { ...t, status, error, retryCount: t.retryCount + 1 }
                                : t
                        )
                    );
                }
            );
        });
    }, []);

    // Get pending transfers
    const getPendingTransfers = useCallback(() => {
        return transfers.filter(t => t.status === SyncStatus.PENDING);
    }, [transfers]);

    return {
        transfers,
        isLoading,
        addTransfer,
        updateTransferStatus,
        getPendingTransfers
    };
}; 