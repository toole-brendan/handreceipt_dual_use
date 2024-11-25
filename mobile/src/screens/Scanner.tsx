import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { RNCamera } from 'react-native-camera';

import { useTransferQueue } from '../hooks/useTransferQueue';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ScanResult } from '../types/scanner';
import { SyncStatus } from '../types/sync';
import { HandReceiptMobile } from '../native/HandReceiptMobile';

const Scanner: React.FC = () => {
  const navigation = useNavigation();
  const [scanning, setScanning] = useState(false);
  const { addTransfer } = useTransferQueue();
  const { isOnline } = useNetworkStatus();

  const handleScan = useCallback(async (data: string) => {
    setScanning(true);
    try {
      // Verify QR code with Rust core
      const scanResult = await HandReceiptMobile.scanQR(data);
      const isValid = await HandReceiptMobile.verifyTransfer(scanResult);

      if (!isValid) {
        Alert.alert('Error', 'Invalid or expired QR code');
        return;
      }

      // Add to transfer queue
      await addTransfer({
        id: scanResult.id,
        propertyId: scanResult.propertyId,
        timestamp: new Date().toISOString(),
        scanData: scanResult,
        status: isOnline ? SyncStatus.PENDING : SyncStatus.OFFLINE,
        retryCount: 0,
      });

      // Navigate to confirmation
      navigation.navigate('TransferConfirmation', {
        scanResult,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setScanning(false);
    }
  }, [navigation, addTransfer, isOnline]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan QR Code</Text>
        {scanning && <ActivityIndicator size="small" color="#0000ff" />}
      </View>

      <QRCodeScanner
        onRead={({ data }) => handleScan(data)}
        flashMode={RNCamera.Constants.FlashMode.auto}
        topContent={
          <Text style={styles.instructions}>
            Align QR code within the frame to scan
          </Text>
        }
        bottomContent={
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline'} Mode
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  statusContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Scanner; 