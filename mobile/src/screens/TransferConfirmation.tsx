import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp, RoutePropType } from '../types/navigation';
import { useTransferQueue } from '../hooks/useTransferQueue';
import { formatDate } from '../utils/date';
import { SyncStatus } from '../types/sync';

interface Props {
  navigation: NavigationProp<'TransferConfirmation'>;
  route: RoutePropType<'TransferConfirmation'>;
}

const TransferConfirmation: React.FC<Props> = ({ navigation, route }) => {
  const { transfer } = route.params;
  const { updateTransferStatus } = useTransferQueue();

  const handleConfirm = async () => {
    try {
      updateTransferStatus(transfer.id, SyncStatus.PENDING);
      Alert.alert('Success', 'Transfer confirmed', [
        { text: 'OK', onPress: () => navigation.navigate('PropertyList') },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    }
  };

  const handleCancel = async () => {
    try {
      updateTransferStatus(transfer.id, SyncStatus.CANCELLED);
      navigation.goBack();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Icon name="qrcode-scan" size={48} color="#333" style={styles.icon} />
        <Text style={styles.title}>Confirm Transfer</Text>
        
        <View style={styles.details}>
          <Text style={styles.label}>Property ID:</Text>
          <Text style={styles.value}>{transfer.propertyId}</Text>
          
          <Text style={styles.label}>Scan Time:</Text>
          <Text style={styles.value}>{formatDate(new Date(transfer.timestamp))}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  details: {
    width: '100%',
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
  },
});

export default TransferConfirmation; 