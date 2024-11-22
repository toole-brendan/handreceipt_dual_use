import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common/Icon';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MeshStats, NetworkQuality, NetworkMetrics } from '@/types/network';
import { formatBytes, formatDuration } from '@/utils/formatters';

interface MeshStatusProps {
  onRefresh?: () => Promise<void>;
}

const MeshStatus: React.FC<MeshStatusProps> = ({ onRefresh }) => {
  const [stats, setStats] = useState<MeshStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isOnline, connectionType, signalStrength } = useNetworkStatus();
  const { colors } = useTheme();

  useEffect(() => {
    fetchMeshStats();
  }, []);

  const fetchMeshStats = async () => {
    try {
      const response = await fetch('/api/mesh/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch mesh stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
      await fetchMeshStats();
    } finally {
      setRefreshing(false);
    }
  };

  const getNetworkQualityColor = (quality: NetworkQuality) => {
    switch (quality.classification) {
      case 'excellent': return colors.success;
      case 'good': return colors.info;
      case 'fair': return colors.warning;
      case 'poor': return colors.error;
      default: return colors.text;
    }
  };

  const renderMetrics = (metrics: NetworkMetrics) => (
    <View style={styles.metricsContainer}>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>Latency</Text>
        <Text style={styles.metricValue}>{metrics.latency}ms</Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>Packet Loss</Text>
        <Text style={styles.metricValue}>{metrics.packetLoss}%</Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>Bandwidth</Text>
        <Text style={styles.metricValue}>{formatBytes(metrics.bandwidth)}/s</Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>Jitter</Text>
        <Text style={styles.metricValue}>{metrics.jitter}ms</Text>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <Icon
            name={isOnline ? 'wifi' : 'wifi-off'}
            size={24}
            color={isOnline ? colors.success : colors.error}
          />
          <Text style={[styles.statusText, { color: isOnline ? colors.success : colors.error }]}>
            {isOnline ? 'Connected' : 'Offline'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Icon name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {stats && (
        <>
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Network Status</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Connected Peers</Text>
                <Text style={styles.statValue}>{stats.connectedPeers}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Available Peers</Text>
                <Text style={styles.statValue}>{stats.availablePeers}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Signal Strength</Text>
                <Text style={styles.statValue}>{signalStrength}dBm</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Uptime</Text>
                <Text style={styles.statValue}>{formatDuration(stats.uptime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Transfer Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Successful</Text>
                <Text style={styles.statValue}>{stats.successfulTransfers}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Failed</Text>
                <Text style={styles.statValue}>{stats.failedTransfers}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Data Sent</Text>
                <Text style={styles.statValue}>{formatBytes(stats.totalBytesSent)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Data Received</Text>
                <Text style={styles.statValue}>{formatBytes(stats.totalBytesReceived)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            {renderMetrics({
              latency: stats.averageLatency,
              packetLoss: 0, // Add to stats
              bandwidth: 0, // Add to stats
              jitter: 0, // Add to stats
            })}
          </View>
        </>
      )}
    </ScrollView>
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
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  statsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  statItem: {
    width: '50%',
    padding: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  metricItem: {
    width: '50%',
    padding: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MeshStatus;
