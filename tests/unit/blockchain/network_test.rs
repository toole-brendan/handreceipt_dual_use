use backend::blockchain::network::core::{p2p::P2PNetwork, sync::NetworkSync};
use backend::mesh::error::MeshError;
use std::time::Duration;

#[cfg(test)]
mod network_tests {
    use super::*;

    #[test]
    fn test_peer_discovery() {
        let network = P2PNetwork::new();
        let test_peer = create_test_peer();
        
        network.add_peer(test_peer.clone());
        let discovered_peers = network.discover_peers();
        
        assert!(discovered_peers.contains(&test_peer), "Added peer should be discoverable");
    }

    #[test]
    fn test_network_sync() {
        let sync_manager = NetworkSync::new();
        let test_data = create_test_blockchain_data();
        
        let sync_result = sync_manager.sync_data(test_data.clone());
        assert!(sync_result.is_ok(), "Network sync should succeed with valid data");
        
        let synced_data = sync_manager.get_synced_data();
        assert_eq!(synced_data, test_data, "Synced data should match original");
    }

    #[test]
    fn test_network_partition_handling() {
        let network = P2PNetwork::new();
        let partition_duration = Duration::from_secs(5);
        
        // Simulate network partition
        network.simulate_partition(partition_duration);
        
        // Verify recovery after partition
        let recovery_status = network.check_network_health();
        assert!(recovery_status.is_ok(), "Network should recover after partition");
    }

    // Helper functions
    fn create_test_peer() -> Peer {
        Peer {
            id: "test_peer_1".to_string(),
            address: "127.0.0.1:8000".parse().unwrap(),
            status: PeerStatus::Active,
        }
    }

    fn create_test_blockchain_data() -> BlockchainData {
        BlockchainData {
            blocks: vec![create_test_block()],
            timestamp: chrono::Utc::now().timestamp(),
        }
    }
}
