import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Asset } from '../database/local/models/asset';
import { AssetStorage } from '../offline/storage/asset_storage';
import { SyncManager } from '../offline/sync/sync_manager';

export const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadAssets = async () => {
    try {
      setLoading(true);
      // Implementation will depend on your AssetStorage methods
      // const loadedAssets = await AssetStorage.getAllAssets();
      // setAssets(loadedAssets);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssets();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAssets();
    // Start sync manager
    const syncManager = SyncManager.getInstance();
    syncManager.startSync();

    return () => {
      syncManager.stopSync();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AssetListItem
            asset={item}
            onPress={() => navigation.navigate('AssetDetails', { id: item.id })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
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
