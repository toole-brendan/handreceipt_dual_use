import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ListRenderItem,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp } from '../types/navigation';
import { useTransferQueue } from '../hooks/useTransferQueue';
import { formatDate } from '../utils/date';
import { SyncStatus, Transfer } from '../types/sync';

interface Props {
    navigation: NavigationProp<'PropertyList'>;
}

const PropertyList: React.FC<Props> = ({ navigation }) => {
    const { transfers, isLoading } = useTransferQueue();

    const renderItem: ListRenderItem<Transfer> = ({ item }) => (
        <View style={styles.item}>
            <View style={styles.itemHeader}>
                <Text style={styles.propertyId}>{item.propertyId}</Text>
                <Text style={styles.timestamp}>
                    {formatDate(new Date(item.timestamp))}
                </Text>
            </View>
            <View style={styles.itemFooter}>
                <Text style={styles.status}>
                    Status: {item.status}
                    {item.status === SyncStatus.FAILED && item.error && ` (${item.error})`}
                </Text>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={transfers}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>No transfers yet</Text>
                    </View>
                }
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Scanner')}
            >
                <Icon name="qrcode-scan" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    propertyId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    timestamp: {
        fontSize: 14,
        color: '#666',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    status: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});

export default PropertyList; 