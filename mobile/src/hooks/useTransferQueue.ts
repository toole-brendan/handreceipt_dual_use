import { useState, useEffect, useCallback } from 'react';
import HandReceiptModule from '../native/HandReceiptMobile';
import { Transfer } from '../types/sync';
import { SyncStatus } from '../types/sync';

export const useTransferQueue = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load stored transfers on mount
    useEffect(() => {
        loadStoredTransfers();
    }, []);

    const loadStoredTransfers = async () => {
        try {
            setIsLoading(true);
            const storedTransfers = await HandReceiptModule.getStoredTransfers();
            setTransfers(storedTransfers);
        } catch (error) {
            console.error('Error loading transfers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTransfer = useCallback(async (transfer: Transfer) => {
        try {
            await HandReceiptModule.storeTransfer(transfer);
            setTransfers(prev => [...prev, transfer]);
        } catch (error) {
            console.error('Error adding transfer:', error);
            throw error;
        }
    }, []);

    const updateTransferStatus = useCallback((id: string, status: SyncStatus, error?: string) => {
        setTransfers(prev => 
            prev.map(t => 
                t.id === id 
                    ? { ...t, status, error } 
                    : t
            )
        );
    }, []);

    const getPendingTransfers = useCallback(() => {
        return transfers.filter(t => t.status === SyncStatus.PENDING);
    }, [transfers]);

    return {
        transfers,
        isLoading,
        addTransfer,
        updateTransferStatus,
        getPendingTransfers,
    };
}; 