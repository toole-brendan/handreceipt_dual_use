import { Platform } from 'react-native';
import Constants from 'expo-constants';

const REST_API_URL = __DEV__ 
  ? `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:8008`
  : 'http://blockchain:8008';

interface DiagnosticsInfo {
  platform: string;
  isEmulator: boolean;
  hasSecureStorage: boolean;
  blockchainEndpoint: string;
  cryptoBackend: string;
  buildType: string;
  deviceInfo: {
    brand?: string;
    manufacturer?: string;
    model?: string;
    systemVersion: string;
  };
}

export function checkEmulatorEnvironment(): DiagnosticsInfo {
  const isEmulator = Platform.isTV || 
    (Platform.OS === 'android' && !Constants.isDevice) ||
    (Platform.OS === 'ios' && !Constants.isDevice);

  return {
    platform: Platform.OS,
    isEmulator,
    hasSecureStorage: Platform.OS === 'ios' || 
      (Platform.OS === 'android' && parseInt(Platform.Version.toString(), 10) > 23),
    blockchainEndpoint: REST_API_URL,
    cryptoBackend: Platform.select({
      android: isEmulator ? 'SoftwareKeyStore' : 'AndroidKeyStore',
      ios: isEmulator ? 'KeychainSwift' : 'SecureEnclave',
      default: 'Unknown'
    }),
    buildType: __DEV__ ? 'Debug' : 'Release',
    deviceInfo: {
      brand: Platform.select({ android: Constants.brand, default: undefined }),
      manufacturer: Platform.select({ android: Constants.manufacturer, default: undefined }),
      model: Platform.select({ android: Constants.model, ios: Constants.modelName, default: undefined }),
      systemVersion: Platform.Version.toString()
    }
  };
} 