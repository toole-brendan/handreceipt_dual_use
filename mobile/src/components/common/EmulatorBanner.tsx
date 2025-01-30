import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';

export const EmulatorBanner: React.FC = () => {
  const isEmulator = Platform.isTV || 
    (Platform.OS === 'android' && !Constants.isDevice) ||
    (Platform.OS === 'ios' && !Constants.isDevice);

  if (!isEmulator) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>🛠 EMULATOR MODE - TEST DATA ONLY</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF9800',
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 