import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { api } from '../Api';
import { Asset } from '../types';

type RouteParams = {
  TransferConfirmation: {
    assetData: Asset;
  };
};

const TransferConfirmation: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'TransferConfirmation'>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const { assetData } = route.params;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const transaction = {
        asset_id: assetData.id,
        timestamp: new Date().toISOString(),
        action: 'TRANSFER',
        metadata: {
          previous_owner: assetData.metadata.current_owner,
          transfer_location: await getCurrentLocation(),
        },
      };

      await api.transferAsset(transaction);

      Alert.alert(
        'Success',
        'Asset transfer initiated successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('AssetList') }]
      );
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert(
        'Error',
        'Failed to initiate transfer. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentLocation = async (): Promise<string> => {
    // Implement location fetching logic here
    return 'Unknown Location';
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (!assetData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid asset data</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Transfer</Text>
        <Text style={styles.subtitle}>Please review the asset details</Text>
      </View>

      <View style={styles.assetDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Asset ID:</Text>
          <Text style={styles.value}>{assetData.id}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{assetData.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Classification:</Text>
          <Text style={[
            styles.value, 
            styles.classification,
            { color: getClassificationColor(assetData.classification) }
          ]}>
            {assetData.classification}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Current Status:</Text>
          <Text style={styles.value}>{assetData.status}</Text>
        </View>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          This action will initiate a transfer of ownership. 
          The transaction will be recorded on the blockchain.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {isProcessing ? (
          <ActivityIndicator size="large" color="#0066cc" />
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>
                Confirm Transfer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, styles.cancelText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const getClassificationColor = (classification: string): string => {
  switch (classification.toUpperCase()) {
    case 'TOP_SECRET': return '#ff0000';
    case 'SECRET': return '#ff4500';
    case 'CONFIDENTIAL': return '#ffa500';
    case 'RESTRICTED': return '#ffff00';
    default: return '#008000';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  assetDetails: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  classification: {
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#0066cc',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#fff',
  },
  cancelText: {
    color: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});

export default TransferConfirmation; 