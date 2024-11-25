import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTransferQueue } from '../hooks/useTransferQueue';
import { formatDate } from '../utils/date';
import { ScanResult } from '../types/scanner';

const TransferConfirmation: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { scanResult } = route.params as { scanResult: ScanResult };
  const { confirmTransfer, cancelTransfer } = useTransferQueue();

  const handleConfirm = useCallback(async () => {
    try {
      await confirmTransfer(scanResult.id);
      Alert.alert(
        'Success',
        'Transfer confirmed. The item will be synced when online.',
        [{ text: 'OK', onPress: () => navigation.navigate('PropertyList') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [scanResult, confirmTransfer, navigation]);

  const handleCancel = useCallback(async () => {
    try {
      await cancelTransfer(scanResult.id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [scanResult, cancelTransfer, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Confirm Transfer</Text>
          <Icon name="qrcode-scan" size={24} color="#333" />
        </View>

        <View style={styles.content}>
          <View style={styles.infoSection}>
            <Text style={styles.label}>Property ID</Text>
            <Text style={styles.value}>{scanResult.propertyId}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Scan Time</Text>
            <Text style={styles.value}>
              {formatDate(new Date(scanResult.timestamp))}
            </Text>
          </View>

          {scanResult.location && (
            <View style={styles.infoSection}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>
                {`${scanResult.location.latitude}, ${scanResult.location.longitude}`}
              </Text>
            </View>
          )}

          <View style={styles.warningSection}>
            <Icon name="alert" size={20} color="#f39c12" />
            <Text style={styles.warningText}>
              By confirming this transfer, you acknowledge receipt of this item
              and accept responsibility for it.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
          >
            <Text style={[styles.buttonText, styles.confirmButtonText]}>
              Confirm Transfer
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  warningSection: {
    flexDirection: 'row',
    backgroundColor: '#fff9e6',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  warningText: {
    marginLeft: 8,
    color: '#666',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
  },
});

export default TransferConfirmation; 