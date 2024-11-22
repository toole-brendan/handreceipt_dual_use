// src/mesh/PeerList.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import WifiP2p, { WifiP2pDevice } from 'react-native-wifi-p2p';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { PeerStatus, ConnectionType } from '@/types/mesh';
import { Icon } from '@/components/common/Icon';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTheme } from '@/hooks/useTheme';

interface Peer {
  id: string;
  name: string;
  type: ConnectionType;
  status: PeerStatus;
  signalStrength: number;
  lastSeen: Date;
  capabilities: string[];
}

const PeerList: React.FC = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const { isOnline, connectionType } = useNetworkStatus();
  const { colors, spacing } = useTheme();
  
  const bleManager = new BleManager();

  const startBluetoothScan = useCallback(async () => {
    try {
      setScanning(true);
      
      bleManager.startDeviceScan(null, {
        allowDuplicates: false,
      }, (error, device) => {
        if (error) {
          console.error('Bluetooth scan error:', error);
          return;
        }

        if (device) {
          const newPeer: Peer = {
            id: device.id,
            name: device.name || 'Unknown Device',
            type: ConnectionType.Bluetooth,
            status: PeerStatus.Available,
            signalStrength: Math.abs(device.rssi || -100),
            lastSeen: new Date(),
            capabilities: device.serviceUUIDs || [],
          };

          setPeers(prevPeers => {
            const exists = prevPeers.find(p => p.id === newPeer.id);
            if (exists) {
              return prevPeers.map(p => 
                p.id === newPeer.id ? { ...p, ...newPeer } : p
              );
            }
            return [...prevPeers, newPeer];
          });
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start Bluetooth scanning');
      console.error('Bluetooth initialization error:', error);
    }
  }, [bleManager]);

  const startWifiDirectScan = useCallback(async () => {
    try {
      setScanning(true);

      await WifiP2p.initialize();
      await WifiP2p.startDiscovering();

      WifiP2p.subscribeOnPeersUpdates((devices: WifiP2pDevice[]) => {
        const wifiPeers: Peer[] = devices.map(device => ({
          id: device.deviceAddress,
          name: device.deviceName,
          type: ConnectionType.WifiDirect,
          status: PeerStatus.Available,
          signalStrength: device.signalStrength || 0,
          lastSeen: new Date(),
          capabilities: ['wifi-direct'],
        }));

        setPeers(prevPeers => {
          const bluetoothPeers = prevPeers.filter(p => p.type === ConnectionType.Bluetooth);
          return [...bluetoothPeers, ...wifiPeers];
        });
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start Wi-Fi Direct scanning');
      console.error('Wi-Fi Direct initialization error:', error);
    }
  }, []);

  const stopScanning = useCallback(() => {
    bleManager.stopDeviceScan();
    WifiP2p.stopDiscovering();
    setScanning(false);
  }, [bleManager]);

  const handlePeerSelect = async (peer: Peer) => {
    setSelectedPeer(peer);
    
    try {
      if (peer.type === ConnectionType.Bluetooth) {
        const device = await bleManager.connectToDevice(peer.id);
        await device.discoverAllServicesAndCharacteristics();
        // Handle Bluetooth connection success
      } else {
        await WifiP2p.connect(peer.id);
        // Handle Wi-Fi Direct connection success
      }
    } catch (error) {
      Alert.alert('Connection Error', `Failed to connect to ${peer.name}`);
      console.error('Connection error:', error);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      startWifiDirectScan();
    }
    startBluetoothScan();

    return () => {
      stopScanning();
      WifiP2p.unsubscribeFromPeersUpdates();
    };
  }, [startBluetoothScan, startWifiDirectScan, stopScanning]);

  const renderPeer = ({ item: peer }: { item: Peer }) => (
    <TouchableOpacity
      style={[
        styles.peerItem,
        selectedPeer?.id === peer.id && styles.selectedPeer,
      ]}
      onPress={() => handlePeerSelect(peer)}
    >
      <Icon
        name={peer.type === ConnectionType.Bluetooth ? 'bluetooth' : 'wifi'}
        size={24}
        color={colors.primary}
      />
      <View style={styles.peerInfo}>
        <Text style={styles.peerName}>{peer.name}</Text>
        <Text style={styles.peerStatus}>
          {peer.status} • Signal: {peer.signalStrength}dBm
        </Text>
      </View>
      <Text style={styles.lastSeen}>
        {formatTimestamp(peer.lastSeen)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Peers</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={scanning ? stopScanning : startBluetoothScan}
        >
          <Text style={styles.scanButtonText}>
            {scanning ? 'Stop Scan' : 'Start Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      {scanning && <LoadingSpinner />}

      <FlatList
        data={peers}
        keyExtractor={item => item.id}
        renderItem={renderPeer}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {scanning ? 'Scanning for peers...' : 'No peers found'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  peerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  selectedPeer: {
    backgroundColor: '#e3f2fd',
  },
  peerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  peerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  peerStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  lastSeen: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
});

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`;
  } else {
    return date.toLocaleTimeString();
  }
};

export default PeerList;