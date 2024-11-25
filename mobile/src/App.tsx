import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './navigation';
import { HandReceiptMobile } from './native/HandReceiptMobile';

const App = () => {
    useEffect(() => {
        const initializeApp = async () => {
            try {
                await HandReceiptMobile.initialize();
            } catch (error) {
                console.error('Initialization error:', error);
            }
        };

        initializeApp();
    }, []);

    return (
        <SafeAreaProvider>
            <Navigation />
        </SafeAreaProvider>
    );
};

export default App; 