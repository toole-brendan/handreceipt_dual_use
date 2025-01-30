import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import Constants from 'expo-constants';
import { RNCamera, BarCodeReadEvent } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useAuth } from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HandReceiptModule from '../../native/HandReceiptMobile';
import { TransferStackNavigationProp } from '../../types/navigation';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const TEST_QR_DATA = {
  propertyId: "TEST-PROPERTY-001",
  signature: "emulated_signature_for_testing"
};

export const ScannerScreen = () => {
  const navigation = useNavigation<TransferStackNavigationProp>();
  const { isOnline } = useNetworkStatus();
  const { user } = useAuth();
  
  const isEmulator = Platform.isTV || 
    (Platform.OS === 'android' && !Constants.isDevice) ||
    (Platform.OS === 'ios' && !Constants.isDevice);
    
  const [scanning, setScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'HandReceipt needs access to your camera to scan QR codes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
        setHasPermission(false);
      }
    } else {
      setHasPermission(true);
    }
  };

  const loadTestQR = useCallback(async () => {
    if (!isEmulator) return;
    
    setLoading(true);
    try {
      const response = await HandReceiptModule.verifyAsset(JSON.stringify(TEST_QR_DATA));
      if (response.success) {
        navigation.navigate('QRGenerator', { itemId: TEST_QR_DATA.propertyId });
      } else {
        Alert.alert('Test Error', 'Failed to verify test QR data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process test QR data');
    } finally {
      setLoading(false);
    }
  }, [navigation, isEmulator]);

  const handleBarCodeRead = useCallback(async (event: BarCodeReadEvent) => {
    if (!scanning || loading) return;
    
    setScanning(false);
    setLoading(true);

    try {
      const response = await HandReceiptModule.verifyAsset(event.data);
      
      if (response.success) {
        navigation.navigate('QRGenerator', { itemId: event.data });
      } else {
        Alert.alert(
          'Invalid Code',
          'This QR code is not associated with any property item.',
          [{ text: 'OK', onPress: () => setScanning(true) }]
        );
      }
    } catch (error) {
      if (!isOnline) {
        Alert.alert(
          'Offline',
          'Please connect to the network to scan items.',
          [{ text: 'OK', onPress: () => setScanning(true) }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to verify the scanned code. Please try again.',
          [{ text: 'OK', onPress: () => setScanning(true) }]
        );
      }
    } finally {
      setLoading(false);
    }
  }, [scanning, loading, navigation, isOnline]);

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Icon name="camera-off" size={48} color="#666" />
        <Text style={styles.permissionText}>Camera permission not granted</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={requestCameraPermission}
        >
          <Text style={styles.retryButtonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isEmulator ? (
        <View style={styles.emulatorContainer}>
          <Text style={styles.emulatorText}>Running in Emulator Mode</Text>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={loadTestQR}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Load Test QR</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator style={styles.loading} />}
        </View>
      ) : (
        <RNCamera
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          flashMode={
            torchOn
              ? RNCamera.Constants.FlashMode.torch
              : RNCamera.Constants.FlashMode.off
          }
          androidCameraPermissionOptions={{
            title: 'Camera Permission',
            message: 'HandReceipt needs access to your camera to scan QR codes.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }}
          onBarCodeRead={handleBarCodeRead}
          captureAudio={false}
        >
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Scan QR Code</Text>
              <TouchableOpacity
                style={styles.torchButton}
                onPress={toggleTorch}
              >
                <Icon
                  name={torchOn ? 'flash-on' : 'flash-off'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.scanArea}>
              {loading && (
                <ActivityIndicator
                  size="large"
                  color="#fff"
                  style={styles.loadingIndicator}
                />
              )}
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>

            <Text style={styles.instructions}>
              Position the QR code within the frame to scan
            </Text>
          </View>
        </RNCamera>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  torchButton: {
    padding: 8,
  },
  scanArea: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#fff',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#fff',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#fff',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#fff',
  },
  loadingIndicator: {
    position: 'absolute',
    alignSelf: 'center',
  },
  instructions: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
  },
  emulatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emulatorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loading: {
    marginTop: 20,
  },
});

export default ScannerScreen; 