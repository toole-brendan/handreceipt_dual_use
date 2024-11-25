import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ScanResult } from '../types/scanner';

// Screens
import Scanner from '../screens/Scanner';
import TransferConfirmation from '../screens/TransferConfirmation';

// Navigation types
export type RootStackParamList = {
    Scanner: undefined;
    TransferConfirmation: {
        scanResult: ScanResult;
    };
};

const Stack = createStackNavigator<RootStackParamList>();

export const Navigation = () => (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName="Scanner"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#f8f9fa',
                },
                headerTintColor: '#333',
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Stack.Screen
                name="Scanner"
                component={Scanner}
                options={{
                    title: 'Scan QR Code',
                }}
            />
            <Stack.Screen
                name="TransferConfirmation"
                component={TransferConfirmation}
                options={{
                    title: 'Confirm Transfer',
                }}
            />
        </Stack.Navigator>
    </NavigationContainer>
); 