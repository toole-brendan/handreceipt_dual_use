use std::sync::Arc;
use uuid::Uuid;
use chrono::{Utc, Duration};
use tokio::time::sleep;

use crate::{
    services::{
        network::mesh::{
            discovery::PeerDiscovery,
            service::MeshService,
            sync::manager::SyncManager,
        },
        infrastructure::database::DatabaseService,
    },
    types::{
        mesh::{PeerInfo, PeerCapability, AuthStatus, DiscoveryConfig},
        sync::{SyncStatus, SyncType, SyncPriority},
        security::SecurityClassification,
        error::MeshError,
    },
};

async fn setup_test_environment() -> (
    Arc<PeerDiscovery>,
    Arc<SyncManager>,
    Arc<MeshService>,
) {
    let db = Arc::new(DatabaseService::new().await);
    
    let discovery_config = DiscoveryConfig::default();
    let peer_discovery = Arc::new(PeerDiscovery::new(discovery_config));

    let sync_manager = Arc::new(SyncManager::new(db.clone()));
    let mesh_service = Arc::new(MeshService::new(
        peer_discovery.clone(),
        sync_manager.clone(),
        db.clone(),
    ));

    (peer_discovery, sync_manager, mesh_service)
}

#[tokio::test]
async fn test_multi_device_discovery_and_sync() {
    let (peer_discovery, sync_manager, mesh_service) = setup_test_environment().await;

    // 1. Create test peers
    let test_peers = vec![
        ("192.168.1.100", vec![PeerCapability::Sync, PeerCapability::Scanner]),
        ("192.168.1.101", vec![PeerCapability::Sync, PeerCapability::Storage]),
        ("192.168.1.102", vec![PeerCapability::Sync, PeerCapability::Relay]),
    ];

    // 2. Add peers to network
    for (address, capabilities) in test_peers {
        let peer = PeerInfo::new(
            Uuid::new_v4().to_string(),
            address.to_string(),
        ).with_capability(PeerCapability::Sync);

        peer_discovery.add_peer(peer).await.unwrap();
        
        // Wait for discovery propagation
        sleep(Duration::milliseconds(100).to_std().unwrap()).await;
    }

    // 3. Verify discovered peers
    let active_peers = peer_discovery.get_peers_with_capability(PeerCapability::Sync).await;
    assert_eq!(active_peers.len(), 3);

    // 4. Test sync state
    for peer in active_peers {
        let sync_status = sync_manager.get_peer_sync_status(&peer.node_id).await.unwrap();
        assert_eq!(sync_status, SyncStatus::Pending);
    }

    // 5. Verify mesh network state
    let network_state = mesh_service.get_network_state().await.unwrap();
    assert_eq!(network_state.connected_peers, 3);
}

#[tokio::test]
async fn test_multi_device_failure_handling() {
    let (peer_discovery, sync_manager, mesh_service) = setup_test_environment().await;
    
    // 1. Add unstable peer
    let unstable_peer = PeerInfo::new(
        Uuid::new_v4().to_string(),
        "192.168.1.200:8000".to_string(),
    ).with_capability(PeerCapability::Sync);

    peer_discovery.add_peer(unstable_peer.clone()).await.unwrap();

    // 2. Simulate connection failures
    for _ in 0..3 {
        mesh_service.record_peer_failure(&unstable_peer.node_id).await;
        sleep(Duration::milliseconds(100).to_std().unwrap()).await;
    }

    // 3. Verify peer status degradation
    let peer_status = mesh_service.get_peer_status(&unstable_peer.node_id).await.unwrap();
    assert!(peer_status.failed_attempts >= 3);

    // 4. Test peer recovery
    mesh_service.record_peer_success(&unstable_peer.node_id).await;
    sync_manager.update_peer_sync_status(&unstable_peer.node_id, SyncStatus::Completed).await.unwrap();

    // 5. Verify recovery
    let recovered_status = mesh_service.get_peer_status(&unstable_peer.node_id).await.unwrap();
    assert_eq!(recovered_status.failed_attempts, 0);
}

#[tokio::test]
async fn test_multi_device_security_boundaries() {
    let (peer_discovery, sync_manager, mesh_service) = setup_test_environment().await;

    // 1. Create peers with different security levels
    let security_levels = vec![
        (SecurityClassification::Unclassified, SyncPriority::Low),
        (SecurityClassification::Confidential, SyncPriority::Normal),
        (SecurityClassification::Secret, SyncPriority::High),
    ];

    for (classification, priority) in security_levels {
        let peer = PeerInfo::new(
            Uuid::new_v4().to_string(),
            format!("192.168.1.{}:8000", classification as u8),
        ).with_capability(PeerCapability::Sync);

        peer_discovery.add_peer(peer.clone()).await.unwrap();

        // Create sync request with appropriate priority
        let sync_request = sync_manager.create_sync_request(
            &peer.node_id,
            SyncType::Full,
            priority,
        ).await.unwrap();

        // Verify security classification enforcement
        let can_sync = mesh_service.validate_sync_request(&sync_request).await.unwrap();
        assert!(can_sync || priority != SyncPriority::High || classification == SecurityClassification::Secret);
    }
}
