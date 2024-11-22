import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import { api } from '../../services/api';

interface ScannerViewProps {
  onScan: (assetId: string) => void;
  onError?: (error: string) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onScan, onError }) => {
  // ... Rest of the component code remains the same ...
};

const { width } = Dimensions.get('window');
const scanAreaSize = width * 0.7;
const cornerSize = 20;

const styles = StyleSheet.create({
  // ... Styles remain the same ...
}); 