use backend::mesh::service::MeshService;
use backend::mesh::discovery::{peer_scanner::PeerScanner, authenticator::PeerAuthenticator};
use backend::mesh::sync::{manager::SyncManager, resolver::ConflictResolver};
use backend::mesh::offline::{storage::OfflineStorage, queue::SyncQueue};
use backend::mesh::error::MeshError;
use crate::common::helpers;
use std::time::Duration;

#[cfg(test)]
mod mesh_service_tests {
    use super::*;

    async fn setup_service() -> MeshService {
        let peer_scanner = PeerScanner::new();
        let authenticator = PeerAuthenticator::new();
        let sync_manager = SyncManager::new();
        let offline_storage = OfflineStorage::new();
        
        MeshService::new(
            peer_scanner,
            authenticator,
            sync_manager,
            offline_storage,
        )
    }

    #[tokio::test]
    async fn test_service_initialization() {
        let service = setup_service().await;
        
        // Verify service components are properly initialized
        assert!(service.is_initialized(), "Service should be initialized");
        assert!(service.get_peer_scanner().is_active(), "Peer scanner should be active");
        assert!(service.get_sync_manager().is_ready(), "Sync manager should be ready");
    }

    #[tokio::test]
    async fn test_service_peer_discovery() {
        let mut service = setup_service().await;
        
        // Start peer discovery
        service.start_peer_discovery().await?;
        tokio::time::sleep(Duration::from_secs(2)).await;
        
        // Verify peers are discovered
        let peers = service.get_discovered_peers().await?;
        assert!(!peers.is_empty(), "Should discover at least one peer");
        
        // Verify peer authentication
        let first_peer = peers.first().unwrap();
        let auth_result = service.authenticate_peer(first_peer).await;
        assert!(auth_result.is_ok(), "Peer authentication should succeed");
    }

    #[tokio::test]
    async fn test_service_sync_operations() {
        let mut service = setup_service().await;
        
        // Create test data
        let test_data = helpers::mesh::create_test_sync_data();
        
        // Test sync operation
        let sync_result = service.sync_data(test_data.clone()).await;
        assert!(sync_result.is_ok(), "Sync operation should succeed");
        
        // Verify data is synced
        let synced_data = service.get_synced_data(&test_data.id).await?;
        assert_eq!(synced_data, test_data, "Synced data should match original");
    }

    #[tokio::test]
    async fn test_service_offline_handling() {
        let mut service = setup_service().await;
        
        // Simulate offline mode
        service.set_offline_mode(true);
        
        // Create offline operation
        let operation = helpers::mesh::create_test_operation();
        let queue_result = service.queue_offline_operation(operation.clone()).await;
        assert!(queue_result.is_ok(), "Should queue offline operation");
        
        // Verify operation is queued
        let queued_ops = service.get_queued_operations().await?;
        assert!(queued_ops.contains(&operation), "Operation should be in queue");
        
        // Restore online mode and process queue
        service.set_offline_mode(false);
        let process_result = service.process_offline_queue().await;
        assert!(process_result.is_ok(), "Should process offline queue");
    }

    #[tokio::test]
    async fn test_service_error_handling() {
        let mut service = setup_service().await;
        
        // Test invalid peer authentication
        let invalid_peer_result = service
            .authenticate_peer(&create_invalid_peer())
            .await;
        assert!(matches!(invalid_peer_result, 
                        Err(MeshError::AuthenticationError(_))));
        
        // Test sync with invalid data
        let invalid_sync_result = service
            .sync_data(create_invalid_sync_data())
            .await;
        assert!(matches!(invalid_sync_result, 
                        Err(MeshError::SyncError(_))));
    }

    #[tokio::test]
    async fn test_service_shutdown() {
        let mut service = setup_service().await;
        
        // Start some operations
        service.start_peer_discovery().await?;
        let test_data = helpers::mesh::create_test_sync_data();
        service.sync_data(test_data).await?;
        
        // Initiate shutdown
        let shutdown_result = service.shutdown().await;
        assert!(shutdown_result.is_ok(), "Service should shutdown gracefully");
        
        // Verify components are properly stopped
        assert!(!service.get_peer_scanner().is_active());
        assert!(!service.get_sync_manager().is_ready());
    }

    // Helper functions
    fn create_invalid_peer() -> Peer {
        Peer {
            id: "invalid_peer".to_string(),
            address: "256.256.256.256:9999".parse().unwrap(), // Invalid IP
            status: PeerStatus::Unknown,
        }
    }

    fn create_invalid_sync_data() -> SyncData {
        SyncData {
            id: "".to_string(), // Invalid empty ID
            timestamp: 0,       // Invalid timestamp
            payload: vec![],    // Empty payload
        }
    }
} 