import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { NavigationProp } from '../types/navigation';
import HandReceiptModule from '../native/HandReceiptMobile';
import { useTransferQueue } from '../hooks/useTransferQueue';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { SyncStatus } from '../types/sync';

interface Props {
  navigation: NavigationProp<'Scanner'>;
}

const Scanner: React.FC<Props> = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const { addTransfer } = useTransferQueue();
  const { isOnline } = useNetworkStatus();

  const handleScan = async (data: { data: string }) => {
    setScanning(true);
    try {
      // Parse QR code locally
      const qrData = await HandReceiptModule.scanQR(data.data);
      
      // Create transfer record
      const transfer = {
        id: qrData.transferId,
        propertyId: qrData.propertyId,
        timestamp: new Date().toISOString(),
        scanData: qrData,
        status: isOnline ? SyncStatus.PENDING : SyncStatus.OFFLINE,
        retryCount: 0
      };

      // Store locally first
      await HandReceiptModule.storeTransfer(transfer);

      // If online, submit to backend immediately
      if (isOnline) {
        const result = await HandReceiptModule.submitTransfer(transfer);
        if (!result.success) {
          Alert.alert('Warning', 'Transfer stored locally. Will sync when online: ' + (result.error || ''));
        }
      } else {
        Alert.alert('Offline Mode', 'Transfer stored locally. Will sync when online.');
      }

      // Navigate to confirmation
      navigation.navigate('TransferConfirmation', {
        transfer
      });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan QR Code</Text>
        {scanning && <ActivityIndicator size="small" color="#0000ff" />}
      </View>

      <QRCodeScanner
        onRead={handleScan}
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
        reactivate={true}
        reactivateTimeout={3000}
      />
    </View>
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