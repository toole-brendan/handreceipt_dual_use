import { Platform, Alert } from 'react-native';

export enum EmulatorError {
  MISSING_X86_LIBS = 'Missing x86 libs',
  TEE_NOT_AVAILABLE = 'TEE_NOT_AVAILABLE',
  CAMERA_NOT_AVAILABLE = 'Camera not available in simulator',
  KEYCHAIN_ACCESS_ERROR = 'Keychain access error in simulator'
}

export function handleEmulatorErrors(error: Error): void {
  // Android-specific emulator errors
  if (Platform.OS === 'android') {
    if (error.message.includes(EmulatorError.MISSING_X86_LIBS)) {
      Alert.alert(
        'Emulator Setup Required',
        'Please install the x86_64 build variant for proper emulator support.',
        [{ text: 'OK' }]
      );
      return;
    }
  }

  // iOS-specific simulator errors
  if (Platform.OS === 'ios') {
    if (error.message.includes(EmulatorError.KEYCHAIN_ACCESS_ERROR)) {
      console.warn('Using in-memory keychain for simulator');
      return;
    }
  }

  // Common emulator errors
  if (error.message.includes(EmulatorError.TEE_NOT_AVAILABLE)) {
    console.warn('Using software keystore fallback for emulator environment');
    return;
  }

  if (error.message.includes(EmulatorError.CAMERA_NOT_AVAILABLE)) {
    console.warn('Using mock camera data for emulator/simulator');
    return;
  }

  // If not an emulator-specific error, rethrow
  throw error;
} 