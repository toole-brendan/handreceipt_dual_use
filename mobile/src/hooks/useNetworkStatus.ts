import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { HandReceiptMobile } from '../native/HandReceiptMobile';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);

    // Handle network state changes
    const handleNetworkChange = useCallback(async (state: NetInfoState) => {
        const wasOnline = isOnline;
        const isNowOnline = state.isConnected ?? false;
        
        setIsOnline(isNowOnline);

        // If we just came back online, sync pending transfers
        if (!wasOnline && isNowOnline) {
            setIsConnecting(true);
            try {
                await HandReceiptMobile.syncTransfers();
            } catch (error) {
                console.error('Sync error:', error);
            } finally {
                setIsConnecting(false);
            }
        }
    }, [isOnline]);

    useEffect(() => {
        // Check initial state
        NetInfo.fetch().then(handleNetworkChange);

        // Subscribe to network changes
        const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

        return () => unsubscribe();
    }, [handleNetworkChange]);

    // Force sync attempt
    const syncNow = useCallback(async () => {
        if (!isOnline) {
            return false;
        }

        setIsConnecting(true);
        try {
            await HandReceiptMobile.syncTransfers();
            return true;
        } catch (error) {
            console.error('Manual sync error:', error);
            return false;
        } finally {
            setIsConnecting(false);
        }
    }, [isOnline]);

    return {
        isOnline,
        isConnecting,
        syncNow
    };
}; 