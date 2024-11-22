import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Asset } from '../database/local/models/asset';
import { AssetStorage } from '../offline/storage/asset_storage';
import { RFIDScanner } from '../scanning/implementations/rfid_scanner';
import { QRScanner } from '../scanning/implementations/qr_scanner';

type RouteParams = {
  AssetDetails: {
    id: string;
  };
};

export const AssetDetails: React.FC = () => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute<RouteProp<RouteParams, 'AssetDetails'>>();
  const navigation = useNavigation();

  const loadAsset = async () => {
    try {
      setLoading(true);
      const loadedAsset = await AssetStorage.getAsset(route.params.id);
      if (!loadedAsset) {
        Alert.alert('Error', 'Asset not found');
        navigation.goBack();
        return;
      }
      setAsset(loadedAsset);
    } catch (error) {
      console.error('Failed to load asset:', error);
      Alert.alert('Error', 'Failed to load asset details');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      const scanner = RFIDScanner.getInstance();
      const result = await scanner.scan();
      
      if (result.assetId === asset?.id) {
        await AssetStorage.recordScan(asset.id, result);
        Alert.alert('Success', 'Asset scanned successfully');
      } else {
        Alert.alert('Error', 'Scanned ID does not match asset');
      }
    } catch (error) {
      console.error('Scan failed:', error);
      Alert.alert('Error', 'Failed to scan asset');
    }
  };

  useEffect(() => {
    loadAsset();
  }, [route.params.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Implement your asset details UI here */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
